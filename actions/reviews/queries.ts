"use server";

import { db } from "@/lib/db";
import { reviews, courseLikes, users, courses } from "@/drizzle/schema";
import { eq, and, desc, count, avg } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { CourseReview, CourseRatingStats } from "./types";

// Helper for DB User ID
const getDbUserId = async (clerkId: string) => {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
    columns: { id: true },
  });
  return user?.id || null;
};

export async function getReviewsByCourse(
  courseId: string,
  page: number = 1,
  limit: number = 10,
): Promise<{
  reviews?: CourseReview[];
  totalCount?: number;
  totalPages?: number;
  currentPage?: number;
  hasNextPage?: boolean;
  error?: string;
}> {
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

export async function getCourseRatingStats(
  courseId: string,
): Promise<CourseRatingStats> {
  try {
    // PERFORMANCE: Run both aggregates in parallel
    const [reviewStatsData, likesStatsData] = await Promise.all([
      db
        .select({
          averageScore: avg(reviews.rating),
          totalReviews: count(reviews.id),
        })
        .from(reviews)
        .where(eq(reviews.courseId, courseId)),
      db
        .select({ totalLikes: count() })
        .from(courseLikes)
        .where(eq(courseLikes.courseId, courseId)),
    ]);

    const reviewStats = reviewStatsData[0];
    const likesStats = likesStatsData[0];

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

export async function getUserReview(courseId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const userId = await getDbUserId(clerkId);
  if (!userId) return null;

  try {
    return await db.query.reviews.findFirst({
      where: and(eq(reviews.courseId, courseId), eq(reviews.userId, userId)),
    });
  } catch (error) {
    console.error("Error fetching user review:", error);
    return null;
  }
}

export async function isCourseLiked(courseId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return false;

  const userId = await getDbUserId(clerkId);
  if (!userId) return false;

  try {
    const like = await db.query.courseLikes.findFirst({
      where: and(
        eq(courseLikes.courseId, courseId),
        eq(courseLikes.userId, userId),
      ),
    });
    return !!like;
  } catch (error) {
    console.error("Error checking course like:", error);
    return false;
  }
}
