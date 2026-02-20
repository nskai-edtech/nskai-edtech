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
} from "@/drizzle/schema";
import { eq, inArray, count, sum, desc, avg, sql, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MonthlyDataPoint {
  month: string; // e.g. "Jan", "Feb"
  value: number;
}

export interface CoursePerformance {
  id: string;
  title: string;
  imageUrl: string | null;
  price: number;
  totalEnrollments: number;
  totalRevenue: number;
  totalLessons: number;
  completionRate: number; // 0–100
  avgQuizScore: number | null; // 0–100, null if no quizzes
}

export interface RecentEnrollment {
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  enrolledAt: Date;
  amount: number;
}

export interface QuizPerformance {
  lessonId: string;
  lessonTitle: string;
  courseTitle: string;
  avgScore: number;
  passRate: number; // 0–100
  totalAttempts: number;
}

export interface TutorAnalytics {
  // KPIs
  totalRevenue: number;
  totalStudents: number;
  publishedCourses: number;
  totalCourses: number;
  avgQuizScore: number | null;

  // Monthly trends (last 6 months)
  revenueByMonth: MonthlyDataPoint[];
  enrollmentsByMonth: MonthlyDataPoint[];

  // Per-course breakdown
  courses: CoursePerformance[];

  // Recent activity
  recentEnrollments: RecentEnrollment[];

  // Quiz stats
  quizPerformance: QuizPerformance[];
}

// ─── Main Action ────────────────────────────────────────────────────────────

export async function getTutorAnalytics(): Promise<
  { error: string } | TutorAnalytics
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

    // ── 1. Get all courses owned by this tutor ──────────────────────────
    const tutorCourses = await db.query.courses.findMany({
      where: eq(courses.tutorId, user.id),
      orderBy: [desc(courses.createdAt)],
    });

    if (tutorCourses.length === 0) {
      return {
        totalRevenue: 0,
        totalStudents: 0,
        publishedCourses: 0,
        totalCourses: 0,
        avgQuizScore: null,
        revenueByMonth: [],
        enrollmentsByMonth: [],
        courses: [],
        recentEnrollments: [],
        quizPerformance: [],
      };
    }

    const courseIds = tutorCourses.map((c) => c.id);
    const publishedCourses = tutorCourses.filter((c) => c.isPublished).length;

    // ── 2. Purchase aggregates per course ───────────────────────────────
    const purchaseStats = await db
      .select({
        courseId: purchases.courseId,
        enrollments: count(purchases.id),
        revenue: sum(purchases.amount),
      })
      .from(purchases)
      .where(inArray(purchases.courseId, courseIds))
      .groupBy(purchases.courseId);

    const purchaseMap = new Map(
      purchaseStats.map((s) => [
        s.courseId,
        { enrollments: s.enrollments, revenue: Number(s.revenue) || 0 },
      ]),
    );

    // ── 3. KPI: Total Revenue & Total Students ──────────────────────────
    const [revenueRow] = await db
      .select({
        total: sql<number>`coalesce(sum(${purchases.amount}), 0)`,
      })
      .from(purchases)
      .where(inArray(purchases.courseId, courseIds));

    const [studentsRow] = await db
      .select({
        count: sql<number>`cast(count(distinct ${purchases.userId}) as integer)`,
      })
      .from(purchases)
      .where(inArray(purchases.courseId, courseIds));

    const totalRevenue = Number(revenueRow?.total) || 0;
    const totalStudents = studentsRow?.count ?? 0;

    // ── 4. Monthly Revenue & Enrollments (last 6 months) ────────────────
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyData = await db
      .select({
        month: sql<string>`to_char(${purchases.createdAt}, 'Mon')`,
        monthNum: sql<number>`extract(month from ${purchases.createdAt})`,
        year: sql<number>`extract(year from ${purchases.createdAt})`,
        revenue: sql<number>`coalesce(sum(${purchases.amount}), 0)`,
        enrollments: count(purchases.id),
      })
      .from(purchases)
      .where(
        and(
          inArray(purchases.courseId, courseIds),
          sql`${purchases.createdAt} >= ${sixMonthsAgo}`,
        ),
      )
      .groupBy(
        sql`to_char(${purchases.createdAt}, 'Mon')`,
        sql`extract(month from ${purchases.createdAt})`,
        sql`extract(year from ${purchases.createdAt})`,
      )
      .orderBy(
        sql`extract(year from ${purchases.createdAt})`,
        sql`extract(month from ${purchases.createdAt})`,
      );

    // Build a complete 6-month array (fill in zeros for empty months)
    const monthNames = [
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

    const revenueByMonth: MonthlyDataPoint[] = [];
    const enrollmentsByMonth: MonthlyDataPoint[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = monthNames[d.getMonth()];
      const monthNum = d.getMonth() + 1;
      const year = d.getFullYear();

      const match = monthlyData.find(
        (m) => Number(m.monthNum) === monthNum && Number(m.year) === year,
      );

      revenueByMonth.push({
        month: label,
        value: match ? Number(match.revenue) : 0,
      });
      enrollmentsByMonth.push({
        month: label,
        value: match ? match.enrollments : 0,
      });
    }

    // ── 5. Lesson counts per course ─────────────────────────────────────
    const lessonCounts = await db
      .select({
        courseId: chapters.courseId,
        lessonCount: count(lessons.id),
      })
      .from(lessons)
      .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
      .where(inArray(chapters.courseId, courseIds))
      .groupBy(chapters.courseId);

    const lessonCountMap = new Map(
      lessonCounts.map((lc) => [lc.courseId, lc.lessonCount]),
    );

    // ── 6. Completion rates per course ──────────────────────────────────
    // completionRate = (completed progress entries) / (total students * total lessons) * 100
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

    // ── 7. Quiz scores per course ───────────────────────────────────────
    const quizScoresByCourse = await db
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
      quizScoresByCourse.map((qs) => [
        qs.courseId,
        qs.avgScore ? Math.round(Number(qs.avgScore)) : null,
      ]),
    );

    // ── 8. Assemble course performance ──────────────────────────────────
    const coursePerformance: CoursePerformance[] = tutorCourses.map(
      (course) => {
        const pStats = purchaseMap.get(course.id);
        const enrollments = pStats?.enrollments ?? 0;
        const revenue = pStats?.revenue ?? 0;
        const totalLessons = lessonCountMap.get(course.id) ?? 0;
        const completedLessons = completionMap.get(course.id) ?? 0;

        // completion rate: completed / (students * totalLessons)
        const totalPossible = enrollments * totalLessons;
        const completionRate =
          totalPossible > 0
            ? Math.round((completedLessons / totalPossible) * 100)
            : 0;

        return {
          id: course.id,
          title: course.title,
          imageUrl: course.imageUrl,
          price: course.price ?? 0,
          totalEnrollments: enrollments,
          totalRevenue: revenue,
          totalLessons,
          completionRate,
          avgQuizScore: quizScoreMap.get(course.id) ?? null,
        };
      },
    );

    // ── 9. KPI: Avg Quiz Score (global) ─────────────────────────────────
    const [globalQuizScore] = await db
      .select({
        avgScore: avg(userQuizAttempts.score),
      })
      .from(userQuizAttempts)
      .innerJoin(lessons, eq(userQuizAttempts.lessonId, lessons.id))
      .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
      .where(inArray(chapters.courseId, courseIds));

    const avgQuizScore = globalQuizScore?.avgScore
      ? Math.round(Number(globalQuizScore.avgScore))
      : null;

    // ── 10. Recent Enrollments (last 10) ────────────────────────────────
    const recentPurchases = await db
      .select({
        studentFirstName: users.firstName,
        studentLastName: users.lastName,
        studentEmail: users.email,
        courseTitle: courses.title,
        enrolledAt: purchases.createdAt,
        amount: purchases.amount,
      })
      .from(purchases)
      .innerJoin(users, eq(purchases.userId, users.id))
      .innerJoin(courses, eq(purchases.courseId, courses.id))
      .where(inArray(purchases.courseId, courseIds))
      .orderBy(desc(purchases.createdAt))
      .limit(10);

    const recentEnrollments: RecentEnrollment[] = recentPurchases.map((p) => ({
      studentName:
        [p.studentFirstName, p.studentLastName].filter(Boolean).join(" ") ||
        "Unknown Student",
      studentEmail: p.studentEmail,
      courseTitle: p.courseTitle,
      enrolledAt: p.enrolledAt,
      amount: p.amount,
    }));

    // ── 11. Quiz Performance (per lesson) ───────────────────────────────
    const quizStats = await db
      .select({
        lessonId: userQuizAttempts.lessonId,
        lessonTitle: lessons.title,
        courseTitle: courses.title,
        avgScore: avg(userQuizAttempts.score),
        totalAttempts: count(userQuizAttempts.id),
        passedCount: sql<number>`cast(sum(case when ${userQuizAttempts.passed} = true then 1 else 0 end) as integer)`,
      })
      .from(userQuizAttempts)
      .innerJoin(lessons, eq(userQuizAttempts.lessonId, lessons.id))
      .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
      .innerJoin(courses, eq(chapters.courseId, courses.id))
      .where(inArray(chapters.courseId, courseIds))
      .groupBy(userQuizAttempts.lessonId, lessons.title, courses.title)
      .orderBy(desc(count(userQuizAttempts.id)));

    const quizPerformance: QuizPerformance[] = quizStats.map((qs) => ({
      lessonId: qs.lessonId,
      lessonTitle: qs.lessonTitle,
      courseTitle: qs.courseTitle,
      avgScore: Math.round(Number(qs.avgScore) || 0),
      passRate:
        qs.totalAttempts > 0
          ? Math.round((qs.passedCount / qs.totalAttempts) * 100)
          : 0,
      totalAttempts: qs.totalAttempts,
    }));

    // ── Return ──────────────────────────────────────────────────────────

    return {
      totalRevenue,
      totalStudents,
      publishedCourses,
      totalCourses: tutorCourses.length,
      avgQuizScore,
      revenueByMonth,
      enrollmentsByMonth,
      courses: coursePerformance,
      recentEnrollments,
      quizPerformance,
    };
  } catch (error) {
    console.error("[GET_TUTOR_ANALYTICS]", error);
    return { error: "Failed to fetch analytics" };
  }
}
