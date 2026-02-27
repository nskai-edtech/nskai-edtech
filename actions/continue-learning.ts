"use server";

import { db } from "@/lib/db";
import {
  userProgress,
  lessons,
  chapters,
  courses,
  users,
} from "@/drizzle/schema";
import { eq, and, desc, count, inArray } from "drizzle-orm";
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
    if (!userId) return [];

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) return [];

    const recentProgress = await db
      .select({
        lessonId: userProgress.lessonId,
        lastAccessedAt: userProgress.lastAccessedAt,
        lessonTitle: lessons.title,
        courseId: chapters.courseId,
        courseTitle: courses.title,
        courseImageUrl: courses.imageUrl,
      })
      .from(userProgress)
      .innerJoin(lessons, eq(userProgress.lessonId, lessons.id))
      .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
      .innerJoin(courses, eq(chapters.courseId, courses.id))
      .where(eq(userProgress.userId, user.id))
      .orderBy(desc(userProgress.lastAccessedAt))
      .limit(20);

    if (recentProgress.length === 0) return [];

    // Extract unique courses (first appearance is the most recent)
    const uniqueCourseIds = new Set<string>();

    const courseLessons: Array<{
      courseId: string;
      courseTitle: string;
      courseImageUrl: string | null;
      lessonId: string;
      lessonTitle: string;
      lastAccessedAt: Date | null;
    }> = [];

    for (const progress of recentProgress) {
      if (!progress.courseId || !progress.lessonId) continue;

      if (!uniqueCourseIds.has(progress.courseId)) {
        uniqueCourseIds.add(progress.courseId);

        courseLessons.push({
          courseId: progress.courseId,
          courseTitle: progress.courseTitle,
          courseImageUrl: progress.courseImageUrl,
          lessonId: progress.lessonId,
          lessonTitle: progress.lessonTitle,
          lastAccessedAt: progress.lastAccessedAt,
        });

        if (courseLessons.length >= limit) break;
      }
    }

    const courseIdsArray = Array.from(uniqueCourseIds);
    if (courseIdsArray.length === 0) return [];

    const totalLessonsData = await db
      .select({
        courseId: chapters.courseId,
        total: count(lessons.id),
      })
      .from(lessons)
      .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
      .where(inArray(chapters.courseId, courseIdsArray))
      .groupBy(chapters.courseId);

    const totalLessonsMap = new Map(
      totalLessonsData.map((t) => [t.courseId, t.total]),
    );

    const completedLessonsData = await db
      .select({
        courseId: chapters.courseId,
        completed: count(userProgress.id),
      })
      .from(userProgress)
      .innerJoin(lessons, eq(userProgress.lessonId, lessons.id))
      .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
      .where(
        and(
          eq(userProgress.userId, user.id),
          eq(userProgress.isCompleted, true),
          inArray(chapters.courseId, courseIdsArray),
        ),
      )
      .groupBy(chapters.courseId);

    const completedLessonsMap = new Map(
      completedLessonsData.map((c) => [c.courseId, c.completed]),
    );

    return courseLessons
      .map((item) => {
        const totalLessons = totalLessonsMap.get(item.courseId) ?? 0;
        const completedLessons = completedLessonsMap.get(item.courseId) ?? 0;

        const progressPercentage =
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        return {
          courseId: item.courseId,
          courseTitle: item.courseTitle,
          courseImageUrl: item.courseImageUrl,
          lessonId: item.lessonId,
          lessonTitle: item.lessonTitle,
          lastAccessedAt: item.lastAccessedAt,
          progressPercentage,
        };
      })
      .filter((c) => c.progressPercentage < 100);
  } catch (error) {
    console.error("[GET_CONTINUE_LEARNING_COURSES]", error);
    return [];
  }
}
