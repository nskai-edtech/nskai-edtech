"use server";

import { db } from "@/lib/db";
import {
  pointTransactions,
  lessons,
  chapters,
  courses,
  users,
} from "@/drizzle/schema";
import { eq, and, sql, desc, gte } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { PointReason } from "./types";

/* ── Types ─────────────────────────────────────────── */

export type TimeRange = "week" | "month" | "all";

export interface CategorySummary {
  reason: PointReason;
  totalXp: number;
  count: number;
}

export interface CourseXpBreakdown {
  courseId: string | null;
  courseTitle: string;
  courseImage: string | null;
  totalXp: number;
  items: CategorySummary[];
}

export interface ActivityEvent {
  id: string;
  amount: number;
  reason: PointReason;
  label: string;
  createdAt: Date;
}

export interface XpBreakdownData {
  totalXp: number;
  categories: CategorySummary[];
  byCourse: CourseXpBreakdown[];
  recentActivity: ActivityEvent[];
}

/* ── Helpers ───────────────────────────────────────── */

function getDateCutoff(range: TimeRange): Date | null {
  if (range === "all") return null;
  const now = new Date();
  if (range === "week") {
    now.setDate(now.getDate() - 7);
  } else {
    now.setMonth(now.getMonth() - 1);
  }
  return now;
}

const REASON_LABELS: Record<PointReason, string> = {
  LESSON_COMPLETED: "Lesson completed",
  QUIZ_PASSED: "Quiz passed",
  MODULE_COMPLETED: "Module completed",
  MODULE_QUIZZES_PASSED: "Module quiz mastery",
  STREAK_7_DAYS: "7-day streak bonus",
  DIAGNOSTIC_COMPLETED: "Diagnostic assessment completed",
  SKILL_MASTERED: "Skill mastered",
};

function formatStreakRef(referenceId: string | null): string {
  if (!referenceId) return "Streak bonus";
  // Format: STREAK_{count}_{date}
  const parts = referenceId.split("_");
  if (parts.length >= 3) {
    const count = parts[1];
    const dateStr = parts.slice(2).join("-");
    try {
      const d = new Date(dateStr + "T00:00:00");
      return `${count}-day streak (${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`;
    } catch {
      return `${count}-day streak`;
    }
  }
  return "Streak bonus";
}

/* ── Main Query ────────────────────────────────────── */

export async function getXpBreakdown(
  range: TimeRange = "all",
): Promise<{ error: string } | XpBreakdownData> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { error: "Unauthorized" };

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
      columns: { id: true, points: true },
    });
    if (!user) return { error: "User not found" };

    const cutoff = getDateCutoff(range);

    // Build a base date filter condition
    const dateFilter = cutoff
      ? and(
          eq(pointTransactions.userId, user.id),
          gte(pointTransactions.createdAt, cutoff),
        )
      : eq(pointTransactions.userId, user.id);

    /* ── 1. Category Summary ─────────────────────── */
    const categoryRows = await db
      .select({
        reason: pointTransactions.reason,
        totalXp: sql<number>`coalesce(sum(${pointTransactions.amount}), 0)`,
        count: sql<number>`count(*)`,
      })
      .from(pointTransactions)
      .where(dateFilter)
      .groupBy(pointTransactions.reason);

    const categories: CategorySummary[] = categoryRows.map((r) => ({
      reason: r.reason as PointReason,
      totalXp: Number(r.totalXp),
      count: Number(r.count),
    }));

    const totalXp = categories.reduce((sum, c) => sum + c.totalXp, 0);

    /* ── 2. Per-Course Breakdown ─────────────────── */
    // Lesson-level reasons: JOIN point_transaction → lesson → chapter → course
    const lessonReasonRows = await db
      .select({
        courseId: courses.id,
        courseTitle: courses.title,
        courseImage: courses.imageUrl,
        reason: pointTransactions.reason,
        totalXp: sql<number>`coalesce(sum(${pointTransactions.amount}), 0)`,
        count: sql<number>`count(*)`,
      })
      .from(pointTransactions)
      .innerJoin(
        lessons,
        eq(lessons.id, sql`${pointTransactions.referenceId}::uuid`),
      )
      .innerJoin(chapters, eq(chapters.id, lessons.chapterId))
      .innerJoin(courses, eq(courses.id, chapters.courseId))
      .where(
        and(
          dateFilter,
          sql`${pointTransactions.reason} IN ('LESSON_COMPLETED', 'QUIZ_PASSED')`,
        ),
      )
      .groupBy(
        courses.id,
        courses.title,
        courses.imageUrl,
        pointTransactions.reason,
      );

    // Module-level reasons: JOIN point_transaction → chapter → course
    const moduleReasonRows = await db
      .select({
        courseId: courses.id,
        courseTitle: courses.title,
        courseImage: courses.imageUrl,
        reason: pointTransactions.reason,
        totalXp: sql<number>`coalesce(sum(${pointTransactions.amount}), 0)`,
        count: sql<number>`count(*)`,
      })
      .from(pointTransactions)
      .innerJoin(
        chapters,
        eq(chapters.id, sql`${pointTransactions.referenceId}::uuid`),
      )
      .innerJoin(courses, eq(courses.id, chapters.courseId))
      .where(
        and(
          dateFilter,
          sql`${pointTransactions.reason} IN ('MODULE_COMPLETED', 'MODULE_QUIZZES_PASSED')`,
        ),
      )
      .groupBy(
        courses.id,
        courses.title,
        courses.imageUrl,
        pointTransactions.reason,
      );

    // Streak reasons (not tied to a course)
    const streakRows = await db
      .select({
        reason: pointTransactions.reason,
        totalXp: sql<number>`coalesce(sum(${pointTransactions.amount}), 0)`,
        count: sql<number>`count(*)`,
      })
      .from(pointTransactions)
      .where(and(dateFilter, eq(pointTransactions.reason, "STREAK_7_DAYS")))
      .groupBy(pointTransactions.reason);

    // Merge into course buckets
    const courseMap = new Map<string, CourseXpBreakdown>();

    for (const row of [...lessonReasonRows, ...moduleReasonRows]) {
      const key = row.courseId;
      if (!courseMap.has(key)) {
        courseMap.set(key, {
          courseId: row.courseId,
          courseTitle: row.courseTitle,
          courseImage: row.courseImage,
          totalXp: 0,
          items: [],
        });
      }
      const bucket = courseMap.get(key)!;
      const xp = Number(row.totalXp);
      bucket.totalXp += xp;
      bucket.items.push({
        reason: row.reason as PointReason,
        totalXp: xp,
        count: Number(row.count),
      });
    }

    // Add streak bucket
    if (streakRows.length > 0 && Number(streakRows[0].totalXp) > 0) {
      const sr = streakRows[0];
      courseMap.set("__streaks__", {
        courseId: null,
        courseTitle: "Streaks",
        courseImage: null,
        totalXp: Number(sr.totalXp),
        items: [
          {
            reason: "STREAK_7_DAYS",
            totalXp: Number(sr.totalXp),
            count: Number(sr.count),
          },
        ],
      });
    }

    const byCourse = Array.from(courseMap.values()).sort(
      (a, b) => b.totalXp - a.totalXp,
    );

    /* ── 3. Recent Activity Timeline ─────────────── */
    // Fetch raw transactions
    const rawActivity = await db
      .select({
        id: pointTransactions.id,
        amount: pointTransactions.amount,
        reason: pointTransactions.reason,
        referenceId: pointTransactions.referenceId,
        createdAt: pointTransactions.createdAt,
      })
      .from(pointTransactions)
      .where(dateFilter)
      .orderBy(desc(pointTransactions.createdAt))
      .limit(50);

    // Resolve labels in bulk
    const lessonIds = rawActivity
      .filter(
        (r) => r.reason === "LESSON_COMPLETED" || r.reason === "QUIZ_PASSED",
      )
      .map((r) => r.referenceId)
      .filter(Boolean) as string[];

    const chapterIds = rawActivity
      .filter(
        (r) =>
          r.reason === "MODULE_COMPLETED" ||
          r.reason === "MODULE_QUIZZES_PASSED",
      )
      .map((r) => r.referenceId)
      .filter(Boolean) as string[];

    // Build lookup maps
    const lessonNameMap = new Map<string, string>();
    const chapterNameMap = new Map<string, string>();

    if (lessonIds.length > 0) {
      const lessonRows = await db
        .select({ id: lessons.id, title: lessons.title })
        .from(lessons)
        .where(sql`${lessons.id} IN ${lessonIds}`);
      for (const l of lessonRows) {
        lessonNameMap.set(l.id, l.title);
      }
    }

    if (chapterIds.length > 0) {
      const chapterRows = await db
        .select({ id: chapters.id, title: chapters.title })
        .from(chapters)
        .where(sql`${chapters.id} IN ${chapterIds}`);
      for (const c of chapterRows) {
        chapterNameMap.set(c.id, c.title);
      }
    }

    const recentActivity: ActivityEvent[] = rawActivity.map((r) => {
      let label: string;
      if (r.reason === "STREAK_7_DAYS") {
        label = formatStreakRef(r.referenceId);
      } else if (
        r.reason === "LESSON_COMPLETED" ||
        r.reason === "QUIZ_PASSED"
      ) {
        const name = lessonNameMap.get(r.referenceId ?? "");
        label = name
          ? `${REASON_LABELS[r.reason as PointReason]}: ${name}`
          : REASON_LABELS[r.reason as PointReason];
      } else {
        const name = chapterNameMap.get(r.referenceId ?? "");
        label = name
          ? `${REASON_LABELS[r.reason as PointReason]}: ${name}`
          : REASON_LABELS[r.reason as PointReason];
      }

      return {
        id: r.id,
        amount: r.amount,
        reason: r.reason as PointReason,
        label,
        createdAt: r.createdAt,
      };
    });

    return { totalXp, categories, byCourse, recentActivity };
  } catch (error) {
    console.error("[GET_XP_BREAKDOWN_ERROR]", error);
    return { error: "Failed to load XP breakdown" };
  }
}
