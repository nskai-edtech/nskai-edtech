"use server";

import { db } from "@/lib/db";
import {
  reviews,
  courseLikes,
  users,
  purchases,
  courses,
} from "@/drizzle/schema";
import { eq, and, desc, count, avg } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function submitReview(
  courseId: string,
  rating: number,
  comment?: string,
) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  if (!dbUser) return { error: "User not found" };

  const purchase = await db.query.purchases.findFirst({
    where: and(
      eq(purchases.courseId, courseId),
      eq(purchases.userId, dbUser.id),
    ),
  });

  if (!purchase) {
    return { error: "You must be enrolled to leave a review." };
  }

  try {
    const existingReview = await db.query.reviews.findFirst({
      where: and(eq(reviews.courseId, courseId), eq(reviews.userId, dbUser.id)),
    });

    if (existingReview) {
      await db
        .update(reviews)
        .set({ rating, comment, createdAt: new Date() })
        .where(eq(reviews.id, existingReview.id));
    } else {
      await db.insert(reviews).values({
        courseId,
        userId: dbUser.id,
        rating,
        comment,
      });
    }

    revalidatePath(`/learner/marketplace/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Error submitting review:", error);
    return { error: "Failed to submit review." };
  }
}

export async function getReviewsByCourse(
  courseId: string,
  page: number = 1,
  limit: number = 10,
) {
  const offset = (page - 1) * limit;

  try {
    const [countResult] = await db
      .select({ count: count() })
      .from(reviews)
      .where(eq(reviews.courseId, courseId));

    const totalCount = countResult?.count ?? 0;
    const totalPages = Math.ceil(totalCount / limit);

    const reviewsData = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          imageUrl: users.imageUrl,
        },
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.courseId, courseId))
      .orderBy(desc(reviews.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      reviews: reviewsData,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
    };
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return { error: "Failed to fetch reviews." };
  }
}

export async function getCourseRatingStats(courseId: string) {
  try {
    const [reviewStats] = await db
      .select({
        averageScore: avg(reviews.rating),
        totalReviews: count(reviews.id),
      })
      .from(reviews)
      .where(eq(reviews.courseId, courseId));

    const [likesStats] = await db
      .select({ totalLikes: count() })
      .from(courseLikes)
      .where(eq(courseLikes.courseId, courseId));

    return {
      avgRating: reviewStats?.averageScore
        ? Number(Number(reviewStats.averageScore).toFixed(1))
        : 0,
      totalReviews: reviewStats?.totalReviews ?? 0,
      totalLikes: likesStats?.totalLikes ?? 0,
    };
  } catch (error) {
    console.error("Error fetching course rating stats:", error);
    return { avgRating: 0, totalReviews: 0, totalLikes: 0 };
  }
}

export async function getTutorRatingStats(tutorId: string) {
  try {
    const [stats] = await db
      .select({
        averageScore: avg(reviews.rating),
        totalReviews: count(reviews.id),
      })
      .from(reviews)
      .innerJoin(courses, eq(reviews.courseId, courses.id))
      .where(eq(courses.tutorId, tutorId));

    return {
      avgRating: stats?.averageScore
        ? Number(Number(stats.averageScore).toFixed(1))
        : 0,
      totalReviews: stats?.totalReviews ?? 0,
    };
  } catch (error) {
    console.error("Error fetching tutor rating stats:", error);
    return { avgRating: 0, totalReviews: 0 };
  }
}

export async function toggleCourseLike(courseId: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  if (!dbUser) return { error: "User not found" };

  try {
    const existingLike = await db.query.courseLikes.findFirst({
      where: and(
        eq(courseLikes.courseId, courseId),
        eq(courseLikes.userId, dbUser.id),
      ),
    });

    if (existingLike) {
      await db.delete(courseLikes).where(eq(courseLikes.id, existingLike.id));
    } else {
      await db.insert(courseLikes).values({
        courseId,
        userId: dbUser.id,
      });
    }

    revalidatePath(`/learner/marketplace/${courseId}`);
    return { success: true, isLiked: !existingLike };
  } catch (error) {
    console.error("Error toggling like:", error);
    return { error: "Failed to toggle like." };
  }
}

export async function getUserReview(courseId: string) {
  const { userId } = await auth();
  if (!userId) return null;

  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
    columns: { id: true },
  });
  if (!dbUser) return null;

  try {
    const review = await db.query.reviews.findFirst({
      where: and(eq(reviews.courseId, courseId), eq(reviews.userId, dbUser.id)),
    });

    return review;
  } catch (error) {
    console.error("Error fetching user review:", error);
    return null;
  }
}

export async function isCourseLiked(courseId: string) {
  const { userId } = await auth();
  if (!userId) return false;

  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
    columns: { id: true },
  });
  if (!dbUser) return false;

  try {
    const like = await db.query.courseLikes.findFirst({
      where: and(
        eq(courseLikes.courseId, courseId),
        eq(courseLikes.userId, dbUser.id),
      ),
    });

    return !!like;
  } catch (error) {
    console.error("Error checking course like:", error);
    return false;
  }
}
