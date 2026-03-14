"use server";

import { db } from "@/lib/db";
import {
  courses,
  purchases,
  users,
  userProgress,
  userQuizAttempts,
  lessons,
  chapters,
  failedPayments,
  dailyWatchTime,
  pointTransactions,
} from "@/drizzle/schema";
import { count, desc, avg, sql, and, eq, inArray } from "drizzle-orm";
import { checkAdmin } from "@/actions/admin/auth";
import type {
  MonthlyDataPoint,
  UserGrowthPoint,
  FailedPaymentRow,
  PlatformEngagement,
  CoursePerformance,
  AdminAnalytics,
} from "./types";

/* ─── helpers ─── */

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function sixMonthWindow() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);
  return sixMonthsAgo;
}

function buildMonthSlots(): { label: string; m: number; y: number }[] {
  const now = new Date();
  const slots: { label: string; m: number; y: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    slots.push({
      label: MONTH_NAMES[d.getMonth()],
      m: d.getMonth() + 1,
      y: d.getFullYear(),
    });
  }
  return slots;
}

/* ─── Revenue & Enrollment Trends (platform-wide) ─── */

async function fetchAdminRevenueTrends(): Promise<{
  revenueByMonth: MonthlyDataPoint[];
  enrollmentsByMonth: MonthlyDataPoint[];
}> {
  const since = sixMonthWindow();

  const monthlyData = await db
    .select({
      monthNum: sql<number>`extract(month from ${purchases.createdAt})`,
      year: sql<number>`extract(year from ${purchases.createdAt})`,
      revenue: sql<number>`coalesce(sum(${purchases.amount}), 0)`,
      enrollments: count(purchases.id),
    })
    .from(purchases)
    .where(sql`${purchases.createdAt} >= ${since}`)
    .groupBy(
      sql`extract(month from ${purchases.createdAt})`,
      sql`extract(year from ${purchases.createdAt})`,
    );

  const slots = buildMonthSlots();
  const revenueByMonth: MonthlyDataPoint[] = [];
  const enrollmentsByMonth: MonthlyDataPoint[] = [];

  for (const slot of slots) {
    const match = monthlyData.find(
      (m) => Number(m.monthNum) === slot.m && Number(m.year) === slot.y,
    );
    revenueByMonth.push({
      month: slot.label,
      value: match ? Number(match.revenue) : 0,
    });
    enrollmentsByMonth.push({
      month: slot.label,
      value: match ? match.enrollments : 0,
    });
  }

  return { revenueByMonth, enrollmentsByMonth };
}

/* ─── User Growth (learners + tutors per month) ─── */

async function fetchAdminUserGrowth(): Promise<UserGrowthPoint[]> {
  const since = sixMonthWindow();

  const rows = await db
    .select({
      monthNum: sql<number>`extract(month from ${users.createdAt})`,
      year: sql<number>`extract(year from ${users.createdAt})`,
      role: users.role,
      total: count(users.id),
    })
    .from(users)
    .where(
      and(
        sql`${users.createdAt} >= ${since}`,
        sql`${users.role} in ('LEARNER', 'TUTOR')`,
      ),
    )
    .groupBy(
      sql`extract(month from ${users.createdAt})`,
      sql`extract(year from ${users.createdAt})`,
      users.role,
    );

  const slots = buildMonthSlots();
  return slots.map((slot) => {
    const learnerRow = rows.find(
      (r) =>
        Number(r.monthNum) === slot.m &&
        Number(r.year) === slot.y &&
        r.role === "LEARNER",
    );
    const tutorRow = rows.find(
      (r) =>
        Number(r.monthNum) === slot.m &&
        Number(r.year) === slot.y &&
        r.role === "TUTOR",
    );
    return {
      month: slot.label,
      learners: learnerRow?.total ?? 0,
      tutors: tutorRow?.total ?? 0,
    };
  });
}

/* ─── Top Courses by Revenue ─── */

async function fetchAdminTopCourses(): Promise<CoursePerformance[]> {
  // Get top 10 published courses by revenue
  const topCourseRows = await db
    .select({
      courseId: purchases.courseId,
      enrollments: count(purchases.id),
      revenue: sql<number>`coalesce(sum(${purchases.amount}), 0)`,
    })
    .from(purchases)
    .groupBy(purchases.courseId)
    .orderBy(desc(sql`coalesce(sum(${purchases.amount}), 0)`))
    .limit(10);

  const courseIds = topCourseRows.map((r) => r.courseId);
  if (courseIds.length === 0) return [];

  // Fetch course details
  const courseDetails = await db
    .select({
      id: courses.id,
      title: courses.title,
      imageUrl: courses.imageUrl,
      price: courses.price,
    })
    .from(courses)
    .where(inArray(courses.id, courseIds));

  const courseMap = new Map(courseDetails.map((c) => [c.id, c]));

  // Lesson counts
  const lessonCounts = await db
    .select({ courseId: chapters.courseId, lessonCount: count(lessons.id) })
    .from(lessons)
    .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
    .where(inArray(chapters.courseId, courseIds))
    .groupBy(chapters.courseId);
  const lessonCountMap = new Map(
    lessonCounts.map((lc) => [lc.courseId, lc.lessonCount]),
  );

  // Completions
  const completionData = await db
    .select({
      courseId: chapters.courseId,
      completedCount: count(userProgress.id),
    })
    .from(userProgress)
    .innerJoin(lessons, eq(userProgress.lessonId, lessons.id))
    .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
    .where(
      and(
        inArray(chapters.courseId, courseIds),
        eq(userProgress.isCompleted, true),
      ),
    )
    .groupBy(chapters.courseId);
  const completionMap = new Map(
    completionData.map((cd) => [cd.courseId, cd.completedCount]),
  );

  // Quiz scores
  const quizScores = await db
    .select({
      courseId: chapters.courseId,
      avgScore: avg(userQuizAttempts.score),
    })
    .from(userQuizAttempts)
    .innerJoin(lessons, eq(userQuizAttempts.lessonId, lessons.id))
    .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
    .where(inArray(chapters.courseId, courseIds))
    .groupBy(chapters.courseId);
  const quizScoreMap = new Map(
    quizScores.map((qs) => [
      qs.courseId,
      qs.avgScore ? Math.round(Number(qs.avgScore)) : null,
    ]),
  );

  // Assemble — ordered by revenue desc
  const purchaseMap = new Map(
    topCourseRows.map((r) => [
      r.courseId,
      { enrollments: r.enrollments, revenue: Number(r.revenue) },
    ]),
  );

  return topCourseRows
    .map((row) => {
      const course = courseMap.get(row.courseId);
      if (!course) return null;
      const pStats = purchaseMap.get(row.courseId);
      const totalLessons = lessonCountMap.get(row.courseId) ?? 0;
      const enrollments = pStats?.enrollments ?? 0;
      const totalPossible = enrollments * totalLessons;

      return {
        id: course.id,
        title: course.title,
        imageUrl: course.imageUrl,
        price: course.price ?? 0,
        totalEnrollments: enrollments,
        totalRevenue: pStats?.revenue ?? 0,
        totalLessons,
        completionRate:
          totalPossible > 0
            ? Math.round(
                ((completionMap.get(row.courseId) ?? 0) / totalPossible) * 100,
              )
            : 0,
        avgQuizScore: quizScoreMap.get(row.courseId) ?? null,
      };
    })
    .filter((c): c is CoursePerformance => c !== null);
}

/* ─── Failed Payments ─── */

async function fetchAdminFailedPayments(): Promise<{
  rows: FailedPaymentRow[];
  totalCount: number;
  totalAmount: number;
}> {
  const since = sixMonthWindow();

  const [totals] = await db
    .select({
      totalCount: count(failedPayments.id),
      totalAmount: sql<number>`coalesce(sum(${failedPayments.amount}), 0)`,
    })
    .from(failedPayments);

  const monthlyData = await db
    .select({
      monthNum: sql<number>`extract(month from ${failedPayments.createdAt})`,
      year: sql<number>`extract(year from ${failedPayments.createdAt})`,
      failCount: count(failedPayments.id),
      failAmount: sql<number>`coalesce(sum(${failedPayments.amount}), 0)`,
    })
    .from(failedPayments)
    .where(sql`${failedPayments.createdAt} >= ${since}`)
    .groupBy(
      sql`extract(month from ${failedPayments.createdAt})`,
      sql`extract(year from ${failedPayments.createdAt})`,
    );

  const slots = buildMonthSlots();
  const rows: FailedPaymentRow[] = slots.map((slot) => {
    const match = monthlyData.find(
      (m) => Number(m.monthNum) === slot.m && Number(m.year) === slot.y,
    );
    return {
      month: slot.label,
      count: match?.failCount ?? 0,
      totalAmount: match ? Number(match.failAmount) : 0,
    };
  });

  return {
    rows,
    totalCount: totals?.totalCount ?? 0,
    totalAmount: Number(totals?.totalAmount) ?? 0,
  };
}

/* ─── Platform Engagement (last 30 days) ─── */

async function fetchAdminEngagement(): Promise<PlatformEngagement> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [watchResult, quizResult, pointsResult, activeResult] =
    await Promise.all([
      db
        .select({
          total: sql<number>`coalesce(sum(${dailyWatchTime.minutesWatched}), 0)`,
        })
        .from(dailyWatchTime)
        .where(
          sql`${dailyWatchTime.recordDate}::timestamp >= ${thirtyDaysAgo}`,
        ),

      db
        .select({ total: count(userQuizAttempts.id) })
        .from(userQuizAttempts)
        .where(sql`${userQuizAttempts.completedAt} >= ${thirtyDaysAgo}`),

      db
        .select({
          total: sql<number>`coalesce(sum(${pointTransactions.amount}), 0)`,
        })
        .from(pointTransactions)
        .where(sql`${pointTransactions.createdAt} >= ${thirtyDaysAgo}`),

      db
        .select({
          total: sql<number>`cast(count(distinct ${userProgress.userId}) as integer)`,
        })
        .from(userProgress)
        .where(sql`${userProgress.lastAccessedAt} >= ${thirtyDaysAgo}`),
    ]);

  return {
    totalWatchMinutes: Number(watchResult[0]?.total) || 0,
    totalQuizAttempts: quizResult[0]?.total ?? 0,
    totalPointsEarned: Number(pointsResult[0]?.total) || 0,
    activeLearnersLast30d: Number(activeResult[0]?.total) || 0,
  };
}

/* ─── Orchestrator ─── */

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  await checkAdmin();

  try {
    const [trends, userGrowth, topCourses, failed, engagement] =
      await Promise.all([
        fetchAdminRevenueTrends(),
        fetchAdminUserGrowth(),
        fetchAdminTopCourses(),
        fetchAdminFailedPayments(),
        fetchAdminEngagement(),
      ]);

    return {
      revenueByMonth: trends.revenueByMonth,
      enrollmentsByMonth: trends.enrollmentsByMonth,
      userGrowth,
      topCourses,
      failedPayments: failed.rows,
      failedPaymentsTotalCount: failed.totalCount,
      failedPaymentsTotalAmount: failed.totalAmount,
      engagement,
    };
  } catch (error) {
    console.error("[ADMIN_ANALYTICS_ERROR]", error);
    // Return safe fallback data so the page still renders
    const emptyMonth = buildMonthSlots().map((s) => ({ month: s.label, value: 0 }));
    return {
      revenueByMonth: emptyMonth,
      enrollmentsByMonth: emptyMonth,
      userGrowth: buildMonthSlots().map((s) => ({ month: s.label, learners: 0, tutors: 0 })),
      topCourses: [],
      failedPayments: buildMonthSlots().map((s) => ({ month: s.label, count: 0, totalAmount: 0 })),
      failedPaymentsTotalCount: 0,
      failedPaymentsTotalAmount: 0,
      engagement: {
        totalWatchMinutes: 0,
        totalQuizAttempts: 0,
        totalPointsEarned: 0,
        activeLearnersLast30d: 0,
      },
    };
  }
}
