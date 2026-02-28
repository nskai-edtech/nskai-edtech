"use server";

import { db } from "@/lib/db";
import {
  purchases,
  userLearningPaths,
  learningPathCourses,
} from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";
import PurchaseConfirmationEmail from "@/emails/PurchaseConfirmationEmail";
import { getPaymentContext, getPathTotalValue } from "./queries";

const PAYSTACK_VERIFY_URL = "https://api.paystack.co/transaction/verify/";

// --- TRANSACTION VERIFIER ---
async function verifyWithPaystack(reference: string) {
  const response = await fetch(`${PAYSTACK_VERIFY_URL}${reference}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  });
  const data = await response.json();
  if (!data.status || data.data.status !== "success") return null;
  return data.data;
}

// --- VERIFY INDIVIDUAL COURSE ---
export async function verifyTransaction(reference: string, courseId: string) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { success: false, message: "Unauthorized" };

    const txData = await verifyWithPaystack(reference);
    if (!txData) return { success: false, message: "Invalid Transaction" };

    const { user, item: course } = await getPaymentContext(
      clerkId,
      courseId,
      "COURSE",
    );
    if (!user || !course) return { success: false, message: "Context missing" };

    // Strict price check
    if (txData.amount < (course.price || 0))
      return { success: false, message: "Amount mismatch" };

    await db
      .insert(purchases)
      .values({
        userId: user.id,
        courseId,
        paystackReference: reference,
        amount: txData.amount,
        status: "success",
      })
      .onConflictDoNothing();

    revalidatePath("/learner");
    revalidatePath("/learner/enrolled");

    sendEmail({
      to: user.email,
      subject: `Enrollment confirmed — ${course.title}`,
      react: PurchaseConfirmationEmail({
        name: user.firstName || "Learner",
        courseTitle: course.title,
        amount: txData.amount,
        courseId,
      }),
    }).catch(() => {});

    return { success: true };
  } catch (error) {
    console.error("Error verifying transaction:", error);
    return { success: false, message: "Internal Error" };
  }
}

// --- VERIFY BUNDLE (PATH) ---
export async function verifyPathTransaction(reference: string, pathId: string) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { success: false, message: "Unauthorized" };

    const txData = await verifyWithPaystack(reference);
    if (!txData) return { success: false, message: "Invalid Transaction" };

    const { user, item: path } = await getPaymentContext(
      clerkId,
      pathId,
      "PATH",
    );
    if (!user || !path)
      return { success: false, message: "Verification failed" };

    const expectedAmount =
      path.price != null ? path.price : await getPathTotalValue(pathId);

    if (txData.amount < expectedAmount) {
      return { success: false, message: "Verification failed" };
    }

    await db.transaction(async (tx) => {
      await tx
        .insert(userLearningPaths)
        .values({
          userId: user.id,
          learningPathId: pathId,
          paystackReference: reference,
          amount: txData.amount,
        })
        .onConflictDoNothing();

      const trackCourses = await tx
        .select({ courseId: learningPathCourses.courseId })
        .from(learningPathCourses)
        .where(eq(learningPathCourses.learningPathId, pathId));

      // Grant access to all courses in the path at once
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

    revalidatePath("/learner");
    revalidatePath("/learner/marketplace");
    revalidatePath("/learner/enrolled");

    sendEmail({
      to: user.email,
      subject: `Track enrollment confirmed — ${path.title}`,
      react: PurchaseConfirmationEmail({
        name: user.firstName || "Learner",
        courseTitle: path.title,
        amount: txData.amount,
        pathId,
      }),
    }).catch(() => {});

    return { success: true };
  } catch (error) {
    console.error("Error enrolling in path:", error);
    return { success: false, message: "Enrollment failed" };
  }
}

// --- FREE ENROLLMENT ---
export async function enrollFree(courseId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { success: false, message: "Unauthorized" };

  const { user, item: course } = await getPaymentContext(
    clerkId,
    courseId,
    "COURSE",
  );
  if (!user || !course) return { success: false, message: "Course not found" };
  if (course.price && course.price > 0)
    return { success: false, message: "Payment required" };

  await db
    .insert(purchases)
    .values({
      userId: user.id,
      courseId,
      paystackReference: `FREE-${courseId}-${user.id}`,
      amount: 0,
      status: "success",
    })
    .onConflictDoNothing();

  revalidatePath("/learner");
  revalidatePath("/learner/enrolled");

  return { success: true, message: "Enrolled successfully" };
}
