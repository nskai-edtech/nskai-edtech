"use server";

import { db } from "@/lib/db";
import {
  users,
  purchases,
  userProgress,
  lessons,
  chapters,
} from "@/drizzle/schema";
import { eq, and, count } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

interface LearnerProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  bio: string | null;
  expertise: string | null;
  interests: string[] | null;
  imageUrl: string | null;
  createdAt: Date | null;
}

interface LearnerStats {
  totalCoursesEnrolled: number;
  totalCoursesCompleted: number;
  totalLessonsCompleted: number;
  completionRate: number;
  memberSince: Date | null;
  lastActivityDate: Date | null;
}

/**
 * Get learner profile data
 */
export async function getLearnerProfile(): Promise<
  { error: string } | LearnerProfile
> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return { error: "User not found" };
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      bio: user.bio,
      expertise: user.expertise,
      interests: user.interests,
      imageUrl: user.imageUrl,
      createdAt: user.createdAt,
    };
  } catch (error) {
    console.error("[GET_LEARNER_PROFILE]", error);
    return { error: "Failed to get profile" };
  }
}

/**
 * Update learner profile (bio, expertise, and interests)
 */
export async function updateLearnerProfile(data: {
  bio?: string;
  expertise?: string;
  interests?: string[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Validate input
    if (data.bio && data.bio.length > 500) {
      return { success: false, error: "Bio must be 500 characters or less" };
    }

    if (data.expertise && data.expertise.length > 200) {
      return {
        success: false,
        error: "Expertise must be 200 characters or less",
      };
    }

    // Update profile
    await db
      .update(users)
      .set({
        bio: data.bio !== undefined ? data.bio : user.bio,
        expertise:
          data.expertise !== undefined ? data.expertise : user.expertise,
        interests:
          data.interests !== undefined ? data.interests : user.interests,
      })
      .where(eq(users.id, user.id));

    // Revalidate profile page
    revalidatePath("/learner/profile");

    return { success: true };
  } catch (error) {
    console.error("[UPDATE_LEARNER_PROFILE]", error);
    return { success: false, error: "Failed to update profile" };
  }
}

/**
 * Get comprehensive learning statistics
 */
export async function getLearnerStats(): Promise<
  { error: string } | LearnerStats
> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return { error: "User not found" };
    }

    // Get total courses enrolled
    const enrolledCoursesResult = await db
      .select({ count: count() })
      .from(purchases)
      .where(eq(purchases.userId, user.id));

    const totalCoursesEnrolled = enrolledCoursesResult[0]?.count ?? 0;

    // Get all enrolled course IDs
    const enrolledCourses = await db
      .select({ courseId: purchases.courseId })
      .from(purchases)
      .where(eq(purchases.userId, user.id));

    // Calculate completed courses (100% progress)
    let totalCoursesCompleted = 0;
    for (const enrollment of enrolledCourses) {
      // Skip if courseId is null
      if (!enrollment.courseId) continue;

      // Get total lessons in this course
      const totalLessonsResult = await db
        .select({ count: count() })
        .from(lessons)
        .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
        .where(eq(chapters.courseId, enrollment.courseId));

      const totalLessons = totalLessonsResult[0]?.count ?? 0;

      if (totalLessons === 0) continue;

      // Get completed lessons in this course
      const completedLessonsResult = await db
        .select({ count: count() })
        .from(userProgress)
        .innerJoin(lessons, eq(userProgress.lessonId, lessons.id))
        .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
        .where(
          and(
            eq(userProgress.userId, user.id),
            eq(userProgress.isCompleted, true),
            eq(chapters.courseId, enrollment.courseId),
          ),
        );

      const completedLessons = completedLessonsResult[0]?.count ?? 0;

      // If all lessons completed, increment counter
      if (completedLessons === totalLessons) {
        totalCoursesCompleted++;
      }
    }

    // Get total lessons completed across all courses
    const totalLessonsCompletedResult = await db
      .select({ count: count() })
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, user.id),
          eq(userProgress.isCompleted, true),
        ),
      );

    const totalLessonsCompleted = totalLessonsCompletedResult[0]?.count ?? 0;

    // Calculate total lessons available in enrolled courses
    let totalLessonsAvailable = 0;
    for (const enrollment of enrolledCourses) {
      // Skip if courseId is null
      if (!enrollment.courseId) continue;

      const lessonsResult = await db
        .select({ count: count() })
        .from(lessons)
        .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
        .where(eq(chapters.courseId, enrollment.courseId));

      totalLessonsAvailable += lessonsResult[0]?.count ?? 0;
    }

    // Calculate completion rate
    const completionRate =
      totalLessonsAvailable > 0
        ? Math.round((totalLessonsCompleted / totalLessonsAvailable) * 100)
        : 0;

    // Get last activity date (most recent progress update)
    const lastActivityResult = await db
      .select({ lastAccessedAt: userProgress.lastAccessedAt })
      .from(userProgress)
      .where(eq(userProgress.userId, user.id))
      .orderBy(userProgress.lastAccessedAt)
      .limit(1);

    const lastActivityDate = lastActivityResult[0]?.lastAccessedAt ?? null;

    return {
      totalCoursesEnrolled,
      totalCoursesCompleted,
      totalLessonsCompleted,
      completionRate,
      memberSince: user.createdAt,
      lastActivityDate,
    };
  } catch (error) {
    console.error("[GET_LEARNER_STATS]", error);
    return { error: "Failed to get statistics" };
  }
}
