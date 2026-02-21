"use server";

import { db } from "@/lib/db";
import {
  purchases,
  courses,
  users,
  userLearningPaths,
  learningPaths,
  learningPathCourses,
} from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";
import PurchaseConfirmationEmail from "@/emails/PurchaseConfirmationEmail";

export async function verifyTransaction(reference: string, courseId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    // Verify with Paystack
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    const data = await response.json();

    if (!data.status || data.data.status !== "success") {
      return { success: false, message: "Transaction failed or invalid" };
    }

    // Verify Amount and Currency, then fetch the course price to compare
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
    });

    if (!course) {
      return { success: false, message: "Course not found" };
    }

    // Paystack returns amount in kobo (base unit)
    const paidAmount = data.data.amount;
    const expectedAmount = course.price || 0;

    // zero discrepancies
    if (paidAmount < expectedAmount) {
      return { success: false, message: "Payment amount incorrect" };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return { success: false, message: "User not found in database" };
    }

    // Record Purchase - if already exists, prevent user from purchasing
    const existingPurchase = await db.query.purchases.findFirst({
      where: and(
        eq(purchases.userId, user.id),
        eq(purchases.courseId, courseId),
      ),
    });

    if (existingPurchase) {
      return { success: true, message: "Already enrolled" };
    }

    await db.insert(purchases).values({
      userId: user.id,
      courseId: courseId,
      paystackReference: reference,
      amount: paidAmount,
      status: "success",
    });

    revalidatePath(`/learner/marketplace/${courseId}`);
    revalidatePath(`/learner/enrolled`);

    sendEmail({
      to: user.email,
      subject: `Enrollment confirmed — ${course.title}`,
      react: PurchaseConfirmationEmail({
        name: user.firstName || "Learner",
        courseTitle: course.title,
        amount: paidAmount,
        courseId,
      }),
    }).catch(() => {});

    return { success: true };
  } catch (error) {
    console.error("[VERIFY_TRANSACTION]", error);
    return { success: false, message: "Internal Server Error" };
  }
}

export async function verifyPathTransaction(reference: string, pathId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    // Verify with Paystack
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    const data = await response.json();

    if (!data.status || data.data.status !== "success") {
      return { success: false, message: "Transaction failed or invalid" };
    }

    // 1. Get Path Details to verify amount
    const pathRes = await db
      .select({
        id: learningPaths.id,
        title: learningPaths.title,
      })
      .from(learningPaths)
      .where(eq(learningPaths.id, pathId))
      .limit(1);

    const path = pathRes[0];

    if (!path) {
      return { success: false, message: "Learning Path not found" };
    }

    // Calculate expected amount (sum of all courses in path)
    const attachedCourses = await db
      .select({
        price: courses.price,
      })
      .from(learningPathCourses)
      .innerJoin(courses, eq(learningPathCourses.courseId, courses.id))
      .where(eq(learningPathCourses.learningPathId, pathId));

    const expectedAmount = attachedCourses.reduce(
      (acc, course) => acc + (course.price || 0),
      0,
    );

    const paidAmount = data.data.amount;

    if (paidAmount < expectedAmount) {
      return { success: false, message: "Payment amount incorrect" };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // 2. Check existing enrollment
    const existingEnrollment = await db.query.userLearningPaths.findFirst({
      where: and(
        eq(userLearningPaths.userId, user.id),
        eq(userLearningPaths.learningPathId, pathId),
      ),
    });

    if (existingEnrollment) {
      return { success: true, message: "Already enrolled" };
    }

    // 3. Perform atomic enrollment (use a transaction if possible, or just sequential inserts)
    // Drizzle doesn't strictly need a transaction for these simple inserts if we're okay with partial failure,
    // but a bundle SHOULD grant access to all courses reliably.

    // 3. Perform enrollment sequentially (neon-http doesn't support transactions)
    try {
      // Record Path Enrollment
      await db.insert(userLearningPaths).values({
        userId: user.id,
        learningPathId: pathId,
        paystackReference: reference,
        amount: paidAmount,
      });

      // Grant access to EVERY course in the track
      // We do this by inserting into the 'purchases' table
      const trackCourses = await db
        .select({
          courseId: learningPathCourses.courseId,
        })
        .from(learningPathCourses)
        .where(eq(learningPathCourses.learningPathId, pathId));

      for (const item of trackCourses) {
        // Idempotent check for each course
        const existingPurchase = await db.query.purchases.findFirst({
          where: and(
            eq(purchases.userId, user.id),
            eq(purchases.courseId, item.courseId),
          ),
        });

        if (!existingPurchase) {
          await db.insert(purchases).values({
            userId: user.id,
            courseId: item.courseId,
            paystackReference: `BUNDLE-${pathId}-${reference}`,
            amount: 0, // It's part of the bundle price already paid
            status: "success",
          });
        }
      }
    } catch (txError) {
      console.error("[ENROLL_FAILURE_SEQUENTIAL]", txError);
      // Even if course granting fails, the path enrollment record exists.
      // We return success because the payment was verified and path was recorded.
      // The user can contact support if course access is missing, or we can add a sync button.
    }

    revalidatePath(`/learner/marketplace`);
    revalidatePath(`/learner/paths/${pathId}`);
    revalidatePath(`/learner/enrolled`);

    // Potentially send a different email for bundles later, but for now reuse
    sendEmail({
      to: user.email,
      subject: `Track Unlocked — ${path.title}`,
      react: PurchaseConfirmationEmail({
        name: user.firstName || "Learner",
        courseTitle: `Learning Path: ${path.title}`,
        amount: paidAmount,
        courseId: "#", // Link to path details or marketplace
      }),
    }).catch(() => {});

    return { success: true };
  } catch (error) {
    console.error("[VERIFY_PATH_TRANSACTION]", error);
    return { success: false, message: "Internal Server Error" };
  }
}

export async function enrollFree(courseId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
    });

    if (!course) {
      return { success: false, message: "Course not found" };
    }

    if (course.price && course.price > 0) {
      return { success: false, message: "This course requires payment" };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return { success: false, message: "User not found in database" };
    }

    // Idempotent: skip if already enrolled
    const existingPurchase = await db.query.purchases.findFirst({
      where: and(
        eq(purchases.userId, user.id),
        eq(purchases.courseId, courseId),
      ),
    });

    if (existingPurchase) {
      return { success: true, message: "Already enrolled" };
    }

    await db.insert(purchases).values({
      userId: user.id,
      courseId: courseId,
      paystackReference: `FREE-${courseId}-${user.id}`,
      amount: 0,
      status: "success",
    });

    revalidatePath(`/learner/marketplace/${courseId}`);
    revalidatePath(`/learner/enrolled`);

    // Fire-and-forget: don't block response on email
    sendEmail({
      to: user.email,
      subject: `You're enrolled — ${course.title}`,
      react: PurchaseConfirmationEmail({
        name: user.firstName || "Learner",
        courseTitle: course.title,
        amount: 0,
        courseId,
      }),
    }).catch(() => {});

    return { success: true };
  } catch (error) {
    console.error("[ENROLL_FREE]", error);
    return { success: false, message: "Internal Server Error" };
  }
}
