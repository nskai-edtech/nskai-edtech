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
import {
  MonthlyDataPoint,
  CoursePerformance,
  RecentEnrollment,
  QuizPerformance,
} from "./types";

type DbCourse = typeof courses.$inferSelect;

export async function fetchKPIs(courseIds: string[]) {
  const [revenueRow] = await db
    .select({ total: sql<number>`coalesce(sum(${purchases.amount}), 0)` })
    .from(purchases)
    .where(inArray(purchases.courseId, courseIds));

  const [studentsRow] = await db
    .select({
      count: sql<number>`cast(count(distinct ${purchases.userId}) as integer)`,
    })
    .from(purchases)
    .where(inArray(purchases.courseId, courseIds));

  const [globalQuizScore] = await db
    .select({ avgScore: avg(userQuizAttempts.score) })
    .from(userQuizAttempts)
    .innerJoin(lessons, eq(userQuizAttempts.lessonId, lessons.id))
    .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
    .where(inArray(chapters.courseId, courseIds));

  return {
    totalRevenue: Number(revenueRow?.total) || 0,
    totalStudents: studentsRow?.count ?? 0,
    avgQuizScore: globalQuizScore?.avgScore
      ? Math.round(Number(globalQuizScore.avgScore))
      : null,
  };
}

export async function fetchMonthlyTrends(courseIds: string[]) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyData = await db
    .select({
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
      sql`extract(month from ${purchases.createdAt})`,
      sql`extract(year from ${purchases.createdAt})`,
    );

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

    const match = monthlyData.find(
      (m) =>
        Number(m.monthNum) === d.getMonth() + 1 &&
        Number(m.year) === d.getFullYear(),
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

  return { revenueByMonth, enrollmentsByMonth };
}

export async function fetchCoursePerformance(
  courseIds: string[],
  tutorCourses: DbCourse[],
): Promise<CoursePerformance[]> {
  // 1. Purchases
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

  // 2. Lessons
  const lessonCounts = await db
    .select({ courseId: chapters.courseId, lessonCount: count(lessons.id) })
    .from(lessons)
    .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
    .where(inArray(chapters.courseId, courseIds))
    .groupBy(chapters.courseId);
  const lessonCountMap = new Map(
    lessonCounts.map((lc) => [lc.courseId, lc.lessonCount]),
  );

  // 3. Completions
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

  // 4. Quiz Scores
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

  // Assemble
  return tutorCourses.map((course) => {
    const pStats = purchaseMap.get(course.id);
    const totalLessons = lessonCountMap.get(course.id) ?? 0;
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
              ((completionMap.get(course.id) ?? 0) / totalPossible) * 100,
            )
          : 0,
      avgQuizScore: quizScoreMap.get(course.id) ?? null,
    };
  });
}

export async function fetchRecentEnrollments(
  courseIds: string[],
): Promise<RecentEnrollment[]> {
  const recent = await db
    .select({
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
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

  return recent.map((p) => ({
    studentName:
      [p.firstName, p.lastName].filter(Boolean).join(" ") || "Unknown Student",
    studentEmail: p.email,
    courseTitle: p.courseTitle,
    enrolledAt: p.enrolledAt,
    amount: p.amount,
  }));
}

export async function fetchQuizPerformance(
  courseIds: string[],
): Promise<QuizPerformance[]> {
  const stats = await db
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

  return stats.map((qs) => ({
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
}
