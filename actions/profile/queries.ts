"use server";

import { db } from "@/lib/db";
import {
  purchases,
  userProgress,
  lessons,
  chapters,
  courses,
} from "@/drizzle/schema";
import { eq, and, sql, desc } from "drizzle-orm";

export async function fetchLearnerAggregateStats(userId: string) {
  const courseStats = await db
    .select({
      courseId: courses.id,
      totalLessons: sql<number>`cast(count(distinct ${lessons.id}) as integer)`,
      completedLessons: sql<number>`cast(count(distinct ${userProgress.id}) as integer)`,
    })
    .from(purchases)
    .innerJoin(courses, eq(purchases.courseId, courses.id))
    .leftJoin(chapters, eq(chapters.courseId, courses.id))
    .leftJoin(lessons, eq(lessons.chapterId, chapters.id))
    .leftJoin(
      userProgress,
      and(
        eq(userProgress.lessonId, lessons.id),
        eq(userProgress.userId, userId),
        eq(userProgress.isCompleted, true),
      ),
    )
    .where(eq(purchases.userId, userId))
    .groupBy(courses.id);

  const lastActivity = await db
    .select({ lastAccessedAt: userProgress.lastAccessedAt })
    .from(userProgress)
    .where(eq(userProgress.userId, userId))
    .orderBy(desc(userProgress.lastAccessedAt))
    .limit(1);

  return {
    courseStats,
    lastActivityDate: lastActivity[0]?.lastAccessedAt ?? null,
  };
}
