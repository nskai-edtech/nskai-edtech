"use server";

import { db } from "@/lib/db";
import {
  users,
  pointTransactions,
  dailyWatchTime,
  userProgress,
  lessons,
  userQuizAttempts,
} from "@/drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";

// ----------------------------------------------------
// 1. CORE POINT TRANSACTION
// ----------------------------------------------------
export async function awardPoints(
  userId: string,
  amount: number,
  reason: "MODULE_COMPLETED" | "MODULE_QUIZZES_PASSED" | "STREAK_7_DAYS",
  referenceId: string,
) {
  // Check for duplicate award
  const existingTx = await db.query.pointTransactions.findFirst({
    where: and(
      eq(pointTransactions.userId, userId),
      eq(pointTransactions.reason, reason),
      eq(pointTransactions.referenceId, referenceId),
    ),
  });

  if (existingTx) {
    // Already awarded
    return { success: false, reason: "ALREADY_AWARDED" };
  }

  // Atomically insert transaction and increment user points
  try {
    await db.transaction(async (tx) => {
      // 1. Log transaction
      await tx.insert(pointTransactions).values({
        userId,
        amount,
        reason,
        referenceId,
      });

      // 2. Increment points
      await tx
        .update(users)
        .set({
          points: sql`${users.points} + ${amount}`,
        })
        .where(eq(users.id, userId));
    });

    return { success: true, amount };
  } catch (error) {
    console.error("[AWARD_POINTS_ERROR]", error);
    return { success: false, reason: "TRANSACTION_FAILED" };
  }
}

// ----------------------------------------------------
// 2. RULE: MODULE COMPLETION (+10 Points)
// ----------------------------------------------------
export async function checkModuleCompletion(userId: string, chapterId: string) {
  try {
    // 1. Get all lessons in this chapter
    const chapterLessons = await db.query.lessons.findMany({
      where: eq(lessons.chapterId, chapterId),
    });

    if (chapterLessons.length === 0) return false;

    // 2. Get user progress for these lessons
    const chapterLessonIds = chapterLessons.map((l) => l.id);
    const completedProgress = await db.query.userProgress.findMany({
      where: and(
        eq(userProgress.userId, userId),
        eq(userProgress.isCompleted, true),
      ),
    });

    // Extract just the completed lesson IDs for this user
    const completedIds = new Set(completedProgress.map((p) => p.lessonId));

    // 3. Are all chapter lesson IDs present in the completed set?
    const allCompleted = chapterLessonIds.every((id) => completedIds.has(id));

    if (allCompleted) {
      await awardPoints(userId, 10, "MODULE_COMPLETED", chapterId);
      return true;
    }

    return false;
  } catch (error) {
    console.error("[CHECK_MODULE_COMPLETION_ERROR]", error);
    return false;
  }
}

// ----------------------------------------------------
// 3. RULE: MODULE QUIZZES PASSED (+25 Points)
// ----------------------------------------------------
export async function checkModuleQuizzesPassed(
  userId: string,
  chapterId: string,
) {
  try {
    // 1. Find all QUIZ lessons in this chapter
    const quizLessons = await db.query.lessons.findMany({
      where: and(eq(lessons.chapterId, chapterId), eq(lessons.type, "QUIZ")),
    });

    if (quizLessons.length === 0) return false;

    // 2. Check if the user has passed all of them
    const quizLessonIds = quizLessons.map((q) => q.id);

    const passedAttempts = await db.query.userQuizAttempts.findMany({
      where: and(
        eq(userQuizAttempts.userId, userId),
        eq(userQuizAttempts.passed, true), // Passed is currently fixed to > 75% in quiz action
      ),
    });

    // Extract just the passed lesson IDs
    const passedIds = new Set(passedAttempts.map((p) => p.lessonId));

    // 3. Are all quiz lesson IDs present in the passed set?
    const allPassed = quizLessonIds.every((id) => passedIds.has(id));

    if (allPassed) {
      await awardPoints(userId, 25, "MODULE_QUIZZES_PASSED", chapterId);
      return true;
    }

    return false;
  } catch (error) {
    console.error("[CHECK_MODULE_QUIZZES_ERROR]", error);
    return false;
  }
}

// ----------------------------------------------------
// 4. RULE: DAILY WATCH TIME & STREAKS (+70 Points per 7 Days)
// ----------------------------------------------------
export async function logVideoWatchTime(userId: string) {
  try {
    // Get today's UTC date string format: YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0];

    // 1. Upsert today's watch time by +1 minute (called via ping every 60s)
    let todaysWatch = await db.query.dailyWatchTime.findFirst({
      where: and(
        eq(dailyWatchTime.userId, userId),
        eq(dailyWatchTime.date, today),
      ),
    });

    if (todaysWatch) {
      const [updated] = await db
        .update(dailyWatchTime)
        .set({
          minutesWatched: todaysWatch.minutesWatched + 1,
          updatedAt: new Date(),
        })
        .where(eq(dailyWatchTime.id, todaysWatch.id))
        .returning();
      todaysWatch = updated;
    } else {
      const [inserted] = await db
        .insert(dailyWatchTime)
        .values({
          userId,
          date: today,
          minutesWatched: 1,
        })
        .returning();
      todaysWatch = inserted;
    }

    // 2. Check if we just crossed the 30 minute minimum threshold for a streak day
    if (todaysWatch.minutesWatched === 30) {
      await updateStreak(userId, today);
    }

    return { success: true, minutes: todaysWatch.minutesWatched };
  } catch (error) {
    console.error("[LOG_WATCH_TIME_ERROR]", error);
    return { success: false };
  }
}

async function updateStreak(userId: string, todayStr: string) {
  const userRecord = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!userRecord) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  // Convert last active date to YYYY-MM-DD string safely
  let lastActiveStr = null;
  if (userRecord.streakLastActiveDate) {
    lastActiveStr = new Date(userRecord.streakLastActiveDate)
      .toISOString()
      .split("T")[0];
  }

  let newCurrentStreak = userRecord.currentStreak;

  // Have they already secured the streak today?
  if (lastActiveStr === todayStr) {
    return; // Do nothing
  }

  // Did they secure it yesterday? (Continue Streak)
  if (lastActiveStr === yesterdayStr) {
    newCurrentStreak += 1;
  } else {
    // They missed a day. Streak resets to 1.
    newCurrentStreak = 1;
  }

  const newLongestStreak = Math.max(newCurrentStreak, userRecord.longestStreak);

  await db
    .update(users)
    .set({
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      streakLastActiveDate: new Date(), // Set to right now
    })
    .where(eq(users.id, userId));

  // Award points if they hit exactly a multiple of 7 days
  if (newCurrentStreak > 0 && newCurrentStreak % 7 === 0) {
    // Reference ID is the date they achieved the multiple to prevent double dipping
    await awardPoints(
      userId,
      70,
      "STREAK_7_DAYS",
      `STREAK_${newCurrentStreak}_${todayStr}`,
    );
  }
}

// ----------------------------------------------------
// 5. LEADERBOARD
// ----------------------------------------------------
export async function getLeaderboard() {
  const topLearners = await db
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

  return topLearners.map((user) => ({
    ...user,
    points: user.points ?? 0,
    currentStreak: user.currentStreak ?? 0,
  }));
}
