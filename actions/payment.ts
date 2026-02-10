"use server";

import { db } from "@/lib/db";
import { purchases, courses, users } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

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

    // Record Purchase - if already exists, prevent user from puchasing
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

    return { success: true };
  } catch (error) {
    console.error("[VERIFY_TRANSACTION]", error);
    return { success: false, message: "Internal Server Error" };
  }
}
