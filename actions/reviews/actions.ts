"use server";

import { db } from "@/lib/db";
import { reviews, courseLikes, users, purchases } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const getDbUserId = async (clerkId: string) => {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
    columns: { id: true },
  });
  return user?.id || null;
};

export async function submitReview(
  courseId: string,
  rating: number,
  comment?: string,
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Unauthorized" };

  const userId = await getDbUserId(clerkId);
  if (!userId) return { error: "User not found" };

  // Verify enrollment
  const purchase = await db.query.purchases.findFirst({
    where: and(eq(purchases.courseId, courseId), eq(purchases.userId, userId)),
  });

  if (!purchase) {
    return { error: "You must be enrolled to leave a review." };
  }

  try {
    await db
      .insert(reviews)
      .values({
        courseId,
        userId,
        rating,
        comment,
      })
      .onConflictDoUpdate({
        target: [reviews.courseId, reviews.userId],
        set: { rating, comment, createdAt: new Date() },
      });

    revalidatePath(`/learner/marketplace/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Error submitting review:", error);
    return { error: "Failed to submit review." };
  }
}

export async function toggleCourseLike(courseId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Unauthorized" };

  const userId = await getDbUserId(clerkId);
  if (!userId) return { error: "User not found" };

  try {
    const existingLike = await db.query.courseLikes.findFirst({
      where: and(
        eq(courseLikes.courseId, courseId),
        eq(courseLikes.userId, userId),
      ),
    });

    if (existingLike) {
      await db.delete(courseLikes).where(eq(courseLikes.id, existingLike.id));
    } else {
      await db.insert(courseLikes).values({ courseId, userId });
    }

    revalidatePath(`/learner/marketplace/${courseId}`);
    return { success: true, isLiked: !existingLike };
  } catch (error) {
    console.error("Error toggling like:", error);
    return { error: "Failed to toggle like." };
  }
}
