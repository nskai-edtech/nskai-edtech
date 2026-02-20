"use server";

import { db } from "@/lib/db";
import { userProgress, lessons, chapters, courses } from "@/drizzle/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

interface ContinueLearningCourse {
  courseId: string;
  courseTitle: string;
  courseImageUrl: string | null;
  lessonId: string;
  lessonTitle: string;
  lastAccessedAt: Date | null;
  progressPercentage: number;
}

/**
 * Get courses with last accessed lessons for "Continue Learning" widget
 */
export async function getContinueLearningCourses(
  limit = 4,
): Promise<ContinueLearningCourse[]> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return [];
    }

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.clerkId, userId),
    });

    if (!user) {
      return [];
    }

    // Get all progress records for this user, ordered by last accessed
    const recentProgress = await db
      .select({
        lessonId: userProgress.lessonId,
        lastAccessedAt: userProgress.lastAccessedAt,
        isCompleted: userProgress.isCompleted,
        lessonTitle: lessons.title,
        chapterId: lessons.chapterId,
      })
      .from(userProgress)
      .innerJoin(lessons, eq(userProgress.lessonId, lessons.id))
      .where(eq(userProgress.userId, user.id))
      .orderBy(desc(userProgress.lastAccessedAt))
      .limit(20);

    if (recentProgress.length === 0) {
      return [];
    }

    // Get unique courses from recent progress
    const uniqueCourseIds = new Set<string>();
    const courseLessons: Array<{
      courseId: string;
      lessonId: string;
      lessonTitle: string;
      lastAccessedAt: Date | null;
    }> = [];

    for (const progress of recentProgress) {
      // Skip if chapterId is null
      if (!progress.chapterId) continue;

      // Get course ID for this lesson
      const chapter = await db.query.chapters.findFirst({
        where: eq(chapters.id, progress.chapterId),
      });

      if (!chapter || !chapter.courseId) continue;

      // Skip if lessonId is null
      if (!progress.lessonId) continue;

      // Only add if we haven't seen this course yet
      if (!uniqueCourseIds.has(chapter.courseId)) {
        uniqueCourseIds.add(chapter.courseId);
        courseLessons.push({
          courseId: chapter.courseId,
          lessonId: progress.lessonId,
          lessonTitle: progress.lessonTitle,
          lastAccessedAt: progress.lastAccessedAt,
        });

        // Stop when we have enough courses
        if (courseLessons.length >= limit) break;
      }
    }

    // Get course details and calculate progress for each
    const continueLearningData = await Promise.all(
      courseLessons.map(async (item) => {
        const course = await db.query.courses.findFirst({
          where: eq(courses.id, item.courseId),
        });

        if (!course) return null;

        // Calculate progress percentage
        const totalLessonsResult = await db
          .select({ count: count() })
          .from(lessons)
          .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
          .where(eq(chapters.courseId, course.id));

        const totalLessons = totalLessonsResult[0]?.count ?? 0;

        const completedLessonsResult = await db
          .select({ count: count() })
          .from(userProgress)
          .innerJoin(lessons, eq(userProgress.lessonId, lessons.id))
          .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
          .where(
            and(
              eq(userProgress.userId, user.id),
              eq(userProgress.isCompleted, true),
              eq(chapters.courseId, course.id),
            ),
          );

        const completedLessons = completedLessonsResult[0]?.count ?? 0;
        const progressPercentage =
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        return {
          courseId: course.id,
          courseTitle: course.title,
          courseImageUrl: course.imageUrl,
          lessonId: item.lessonId,
          lessonTitle: item.lessonTitle,
          lastAccessedAt: item.lastAccessedAt,
          progressPercentage,
        };
      }),
    );

    // Filter out nulls and return
    return continueLearningData.filter(
      (item): item is ContinueLearningCourse => item !== null,
    );
  } catch (error) {
    console.error("[GET_CONTINUE_LEARNING_COURSES]", error);
    return [];
  }
}
