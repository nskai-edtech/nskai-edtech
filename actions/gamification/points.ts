"use server";

import { db } from "@/lib/db";
import { users, pointTransactions, dailyWatchTime } from "@/drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { PointReason } from "./types";
import { getChapterCompletionStats, getChapterQuizStats } from "./queries";

// --- AWARD POINTS (Atomic Transaction) ---
export async function awardPoints(
  userId: string,
  amount: number,
  reason: PointReason,
  referenceId: string,
) {
  try {
    // Insert the point transaction, deduplicated by unique constraint
    const [inserted] = await db
      .insert(pointTransactions)
      .values({
        userId,
        amount,
        reason,
        referenceId,
      })
      .onConflictDoNothing()
      .returning({ id: pointTransactions.id });

    // Only increment points when a new transaction was actually created
    if (inserted) {
      await db
        .update(users)
        .set({ points: sql`${users.points} + ${amount}` })
        .where(eq(users.id, userId));
    }

    return { success: !!inserted, awarded: !!inserted };
  } catch (error) {
    console.error("[AWARD_POINTS_ERROR]", error);
    return { success: false, awarded: false };
  }
}

// --- LOG WATCH TIME (High Frequency Ping) ---
// Accepts the Clerk ID from the client and resolves it to the DB UUID
export async function logVideoWatchTime(clerkId: string) {
  const today = new Date().toISOString().split("T")[0];

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
      columns: { id: true },
    });
    if (!user) return { success: false };

    const [row] = await db
      .insert(dailyWatchTime)
      .values({ userId: user.id, recordDate: today, minutesWatched: 1 })
      .onConflictDoUpdate({
        target: [dailyWatchTime.userId, dailyWatchTime.recordDate],
        set: {
          minutesWatched: sql`${dailyWatchTime.minutesWatched} + 1`,
          updatedAt: new Date(),
        },
      })
      .returning();

    // Trigger streak check once the user hits the 30-minute threshold
    // Use >= instead of === to handle cases where minutesWatched jumps past 30
    // (updateStreak is already idempotent via streakLastActiveDate check)
    if (row.minutesWatched >= 30) {
      await updateStreak(user.id, today);
    }

    return { success: true, minutes: row.minutesWatched };
  } catch (error) {
    console.error("[LOG_WATCH_TIME_ERROR]", error);
    return { success: false };
  }
}

// --- STREAK LOGIC ---
async function updateStreak(userId: string, todayStr: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (
    !user ||
    user.streakLastActiveDate?.toISOString().split("T")[0] === todayStr
  )
    return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const isContinuous =
    user.streakLastActiveDate?.toISOString().split("T")[0] === yesterdayStr;
  const newStreak = isContinuous ? user.currentStreak + 1 : 1;

  await db
    .update(users)
    .set({
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, user.longestStreak),
      streakLastActiveDate: new Date(),
    })
    .where(eq(users.id, userId));

  if (newStreak % 7 === 0) {
    await awardPoints(
      userId,
      70,
      "STREAK_7_DAYS",
      `STREAK_${newStreak}_${todayStr}`,
    );
  }

  revalidatePath("/learner");
  revalidatePath("/leaderboard");
}

// --- COMPLETION CHECKS ---
export async function checkModuleCompletion(userId: string, chapterId: string) {
  const { total, completed } = await getChapterCompletionStats(
    userId,
    chapterId,
  );
  if (total > 0 && total === completed) {
    return await awardPoints(userId, 10, "MODULE_COMPLETED", chapterId);
  }
}

export async function checkModuleQuizzesPassed(
  userId: string,
  chapterId: string,
) {
  const { totalQuizzes, passedQuizzes } = await getChapterQuizStats(
    userId,
    chapterId,
  );

  if (totalQuizzes > 0 && totalQuizzes === passedQuizzes) {
    return await awardPoints(userId, 25, "MODULE_QUIZZES_PASSED", chapterId);
  }
}
