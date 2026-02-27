import { db } from "@/lib/db";
import {
  purchases,
  users,
  courses,
  learningPaths,
  learningPathCourses,
  userLearningPaths,
} from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";
import PurchaseConfirmationEmail from "@/emails/PurchaseConfirmationEmail";

interface PaystackCustomField {
  display_name: string;
  variable_name: string;
  value: string;
}

interface PaystackWebhookCustomer {
  email: string;
  customer_code: string;
}

interface PaystackWebhookMetadata {
  courseId?: string;
  pathId?: string;
  custom_fields?: PaystackCustomField[];
}

interface PaystackWebhookData {
  reference: string;
  amount: number;
  currency: string;
  status: string;
  customer: PaystackWebhookCustomer;
  metadata?: PaystackWebhookMetadata;
}

interface PaystackWebhookEvent {
  event: string;
  data: PaystackWebhookData;
}

function extractCourseId(metadata?: PaystackWebhookMetadata): string | null {
  if (metadata?.courseId) return metadata.courseId;

  const field = metadata?.custom_fields?.find(
    (f) => f.variable_name === "course_id",
  );
  return field?.value ?? null;
}

function extractPathId(metadata?: PaystackWebhookMetadata): string | null {
  if (metadata?.pathId) return metadata.pathId;

  const field = metadata?.custom_fields?.find(
    (f) => f.variable_name === "path_id",
  );
  return field?.value ?? null;
}

function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return false;

  const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");

  return hash === signature;
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("x-paystack-signature") || "";

    // Verify webhook signature
    if (!verifySignature(body, signature)) {
      return new Response("Invalid signature", { status: 401 });
    }

    const event: PaystackWebhookEvent = JSON.parse(body);

    // Only process successful charges
    if (event.event !== "charge.success") {
      return new Response("OK", { status: 200 });
    }

    const { reference, amount, customer, metadata } = event.data;

    // Check if this reference was already processed as a course purchase
    const existingPurchase = await db.query.purchases.findFirst({
      where: eq(purchases.paystackReference, reference),
    });

    if (existingPurchase) {
      return new Response("OK", { status: 200 });
    }

    // Also check userLearningPaths — path purchases won't appear in purchases table
    // under the raw reference (only as BUNDLE- prefixed rows)
    const existingPathEnrollment = await db.query.userLearningPaths.findFirst({
      where: eq(userLearningPaths.paystackReference, reference),
    });

    if (existingPathEnrollment) {
      return new Response("OK", { status: 200 });
    }

    // Resolve user by email — needed for both flows
    const user = await db.query.users.findFirst({
      where: eq(users.email, customer.email),
    });

    if (!user) {
      console.error("[PAYSTACK_WEBHOOK] User not found", {
        email: customer.email,
      });
      return new Response("OK", { status: 200 });
    }

    // Route to the correct handler based on what's in the metadata.
    // Path is checked first since a path payment has no single courseId.
    const pathId = extractPathId(metadata);
    if (pathId) {
      await handlePathPurchase({ reference, amount, user, pathId });
      return new Response("OK", { status: 200 });
    }

    const courseId = extractCourseId(metadata);
    if (courseId) {
      await handleCoursePurchase({ reference, amount, user, courseId });
      return new Response("OK", { status: 200 });
    }

    // Neither courseId nor pathId found — log and bail
    console.error("[PAYSTACK_WEBHOOK] No courseId or pathId in metadata", {
      reference,
    });
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[PAYSTACK_WEBHOOK] Error:", error);
    return new Response("OK", { status: 200 });
  }
}

// ─── COURSE HANDLER

interface HandleCoursePurchaseArgs {
  reference: string;
  amount: number;
  user: { id: string; email: string; firstName: string | null };
  courseId: string;
}

async function handleCoursePurchase({
  reference,
  amount,
  user,
  courseId,
}: HandleCoursePurchaseArgs) {
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  });

  if (!course) {
    console.error("[PAYSTACK_WEBHOOK] Course not found", { courseId });
    return;
  }

  // Double-check no purchase for this user+course (unique index safety net)
  const userPurchase = await db.query.purchases.findFirst({
    where: and(eq(purchases.userId, user.id), eq(purchases.courseId, courseId)),
  });

  if (userPurchase) return;

  await db.insert(purchases).values({
    userId: user.id,
    courseId,
    paystackReference: reference,
    amount,
    status: "success",
  });

  console.log("[PAYSTACK_WEBHOOK] Course purchase created", {
    reference,
    courseId,
    userId: user.id,
  });

  revalidatePath("/learner/enrolled");

  sendEmail({
    to: user.email,
    subject: `Enrollment confirmed — ${course.title}`,
    react: PurchaseConfirmationEmail({
      name: user.firstName || "Learner",
      courseTitle: course.title,
      amount,
      courseId,
    }),
  }).catch(() => {});
}

// ─── PATH HANDLER

interface HandlePathPurchaseArgs {
  reference: string;
  amount: number;
  user: { id: string; email: string; firstName: string | null };
  pathId: string;
}

async function handlePathPurchase({
  reference,
  amount,
  user,
  pathId,
}: HandlePathPurchaseArgs) {
  const path = await db.query.learningPaths.findFirst({
    where: eq(learningPaths.id, pathId),
  });

  if (!path) {
    console.error("[PAYSTACK_WEBHOOK] Learning path not found", { pathId });
    return;
  }

  await db.transaction(async (tx) => {
    // Enroll user in the path
    await tx
      .insert(userLearningPaths)
      .values({
        userId: user.id,
        learningPathId: pathId,
        paystackReference: reference,
        amount,
      })
      .onConflictDoNothing();

    // Fetch all courses in the path
    const trackCourses = await tx
      .select({ courseId: learningPathCourses.courseId })
      .from(learningPathCourses)
      .where(eq(learningPathCourses.learningPathId, pathId));

    // Grant access to every course in the path
    for (const item of trackCourses) {
      await tx
        .insert(purchases)
        .values({
          userId: user.id,
          courseId: item.courseId,
          paystackReference: `BUNDLE-${pathId}-${reference}`,
          amount: 0,
          status: "success",
        })
        .onConflictDoNothing();
    }
  });

  console.log("[PAYSTACK_WEBHOOK] Path purchase created", {
    reference,
    pathId,
    userId: user.id,
  });

  revalidatePath("/learner/marketplace");
  revalidatePath("/learner/enrolled");

  sendEmail({
    to: user.email,
    subject: `Track enrollment confirmed — ${path.title}`,
    react: PurchaseConfirmationEmail({
      name: user.firstName || "Learner",
      courseTitle: path.title,
      amount,
      pathId,
    }),
  }).catch(() => {});
}
