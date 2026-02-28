"use server";

import { db } from "@/lib/db";
import { users, lessons, userProgress } from "@/drizzle/schema";
import { userQuizAttempts } from "@/drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { LeaderboardUser } from "./types";

/**
 * Gets the total number of lessons vs completed lessons for a chapter
 */
export async function getChapterCompletionStats(
  userId: string,
  chapterId: string,
) {
  const [stats] = await db
    .select({
      totalLessons: sql<number>`count(distinct ${lessons.id})`,
      completedCount: sql<number>`count(distinct ${userProgress.lessonId})`,
    })
    .from(lessons)
    .leftJoin(
      userProgress,
      and(
        eq(userProgress.lessonId, lessons.id),
        eq(userProgress.userId, userId),
        eq(userProgress.isCompleted, true),
      ),
    )
    .where(eq(lessons.chapterId, chapterId));

  return {
    total: Number(stats?.totalLessons || 0),
    completed: Number(stats?.completedCount || 0),
  };
}

export async function getLeaderboardData(): Promise<LeaderboardUser[]> {
  return await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      imageUrl: users.imageUrl,
      points: users.points,
      currentStreak: users.currentStreak,
    })
    .from(users)
    .where(eq(users.role, "LEARNER"))
    .orderBy(desc(users.points))
    .limit(50);
}

/**
 * Gets the total number of quizzes vs passed quizzes for a chapter in ONE query
 */
export async function getChapterQuizStats(userId: string, chapterId: string) {
  const [stats] = await db
    .select({
      totalQuizzes: sql<number>`count(distinct ${lessons.id})`,
      passedQuizzes: sql<number>`count(distinct ${userQuizAttempts.lessonId})`,
    })
    .from(lessons)
    .leftJoin(
      userQuizAttempts,
      and(
        eq(userQuizAttempts.lessonId, lessons.id),
        eq(userQuizAttempts.userId, userId),
        eq(userQuizAttempts.passed, true),
      ),
    )
    .where(and(eq(lessons.chapterId, chapterId), eq(lessons.type, "QUIZ")));

  return {
    totalQuizzes: Number(stats?.totalQuizzes || 0),
    passedQuizzes: Number(stats?.passedQuizzes || 0),
  };
}
