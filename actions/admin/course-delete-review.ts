"use server";

import { db } from "@/lib/db";
import {
  courses,
  courseRequests,
  purchases,
  reviews,
  courseLikes,
  certificates,
  chapters,
  lessons,
  userProgress,
  userQuizAttempts,
  assignments,
  assignmentSubmissions,
  users,
} from "@/drizzle/schema";
import { eq, and, count, avg, sql, desc, inArray } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface CourseDeleteReviewData {
  request: {
    id: string;
    type: "DRAFT" | "DELETE";
    reason: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: Date;
  };
  course: {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    price: number | null;
    status: string;
    tags: string[] | null;
    createdAt: Date;
  };
  tutor: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    imageUrl: string | null;
  } | null;
  analytics: {
    totalStudents: number;
    totalRevenue: number;
    totalReviews: number;
    averageRating: number | null;
    totalLikes: number;
    completionRate: number;
    activeEnrollments: number;
    completedStudents: number;
    certificatesIssued: number;
    avgQuizScore: number | null;
    quizPassRate: number | null;
    totalQuizAttempts: number;
    assignmentSubmissions: {
      pending: number;
      graded: number;
      rejected: number;
      total: number;
    };
    courseRanking: {
      rank: number;
      totalCourses: number;
    };
    revenueByMonth: Array<{ month: string; value: number }>;
    enrollmentsByMonth: Array<{ month: string; value: number }>;
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

async function assertOrgAdmin() {
  const { sessionClaims } = await auth();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    throw new Error("Unauthorized: Admin access required.");
  }
}

// ─── Get Course Delete Review Data ──────────────────────────────────────────────

export async function getCourseDeleteReview(
  requestId: string,
): Promise<{ data?: CourseDeleteReviewData; error?: string }> {
  try {
    await assertOrgAdmin();
  } catch {
    return { error: "Unauthorized" };
  }

  // 1. Fetch the request
  const request = await db.query.courseRequests.findFirst({
    where: eq(courseRequests.id, requestId),
  });

  if (!request) return { error: "Request not found" };
  if (request.type !== "DELETE") return { error: "Not a delete request" };
  if (request.status !== "PENDING")
    return { error: "Request already resolved" };

  // 2. Fetch the course
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, request.courseId),
  });

  if (!course) return { error: "Course not found" };

  // 3. Fetch tutor
  const tutor = course.tutorId
    ? await db.query.users.findFirst({
        where: eq(users.id, course.tutorId),
      })
    : null;

  // 4. Gather all analytics in parallel
  const courseId = course.id;

  // Get chapter IDs and lesson IDs for subqueries
  const courseChapters = await db
    .select({ id: chapters.id })
    .from(chapters)
    .where(eq(chapters.courseId, courseId));
  const chapterIds = courseChapters.map((c) => c.id);

  let lessonIds: string[] = [];
  if (chapterIds.length > 0) {
    const courseLessons = await db
      .select({ id: lessons.id })
      .from(lessons)
      .where(inArray(lessons.chapterId, chapterIds));
    lessonIds = courseLessons.map((l) => l.id);
  }

  const [
    studentsResult,
    revenueResult,
    reviewsResult,
    likesResult,
    certificatesResult,
    quizResult,
    assignmentResult,
    monthlyRevenueData,
    monthlyEnrollmentData,
    courseRankingData,
    progressData,
  ] = await Promise.all([
    // Total students (distinct purchasers)
    db
      .select({
        count: sql<number>`cast(count(distinct ${purchases.userId}) as integer)`,
      })
      .from(purchases)
      .where(eq(purchases.courseId, courseId)),

    // Total revenue
    db
      .select({ total: sql<number>`coalesce(sum(${purchases.amount}), 0)` })
      .from(purchases)
      .where(eq(purchases.courseId, courseId)),

    // Reviews + average rating
    db
      .select({
        count: count(reviews.id),
        avgRating: avg(reviews.rating),
      })
      .from(reviews)
      .where(eq(reviews.courseId, courseId)),

    // Total likes
    db
      .select({ count: count(courseLikes.id) })
      .from(courseLikes)
      .where(eq(courseLikes.courseId, courseId)),

    // Certificates issued
    db
      .select({ count: count(certificates.id) })
      .from(certificates)
      .where(eq(certificates.courseId, courseId)),

    // Quiz performance (only if there are lessons)
    lessonIds.length > 0
      ? db
          .select({
            avgScore: avg(userQuizAttempts.score),
            totalAttempts: count(userQuizAttempts.id),
            passedCount: sql<number>`cast(sum(case when ${userQuizAttempts.passed} = true then 1 else 0 end) as integer)`,
          })
          .from(userQuizAttempts)
          .where(inArray(userQuizAttempts.lessonId, lessonIds))
      : Promise.resolve([{ avgScore: null, totalAttempts: 0, passedCount: 0 }]),

    // Assignment submissions
    chapterIds.length > 0
      ? db
          .select({
            status: assignmentSubmissions.status,
            count: count(assignmentSubmissions.id),
          })
          .from(assignmentSubmissions)
          .innerJoin(
            assignments,
            eq(assignmentSubmissions.assignmentId, assignments.id),
          )
          .where(eq(assignments.courseId, courseId))
          .groupBy(assignmentSubmissions.status)
      : Promise.resolve([]),

    // Monthly revenue (last 6 months)
    (() => {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      sixMonthsAgo.setHours(0, 0, 0, 0);
      return db
        .select({
          monthNum: sql<number>`extract(month from ${purchases.createdAt})`,
          year: sql<number>`extract(year from ${purchases.createdAt})`,
          revenue: sql<number>`coalesce(sum(${purchases.amount}), 0)`,
        })
        .from(purchases)
        .where(
          and(
            eq(purchases.courseId, courseId),
            sql`${purchases.createdAt} >= ${sixMonthsAgo}`,
          ),
        )
        .groupBy(
          sql`extract(month from ${purchases.createdAt})`,
          sql`extract(year from ${purchases.createdAt})`,
        );
    })(),

    // Monthly enrollments (last 6 months)
    (() => {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      sixMonthsAgo.setHours(0, 0, 0, 0);
      return db
        .select({
          monthNum: sql<number>`extract(month from ${purchases.createdAt})`,
          year: sql<number>`extract(year from ${purchases.createdAt})`,
          enrollments: count(purchases.id),
        })
        .from(purchases)
        .where(
          and(
            eq(purchases.courseId, courseId),
            sql`${purchases.createdAt} >= ${sixMonthsAgo}`,
          ),
        )
        .groupBy(
          sql`extract(month from ${purchases.createdAt})`,
          sql`extract(year from ${purchases.createdAt})`,
        );
    })(),

    // Course ranking by revenue (among all published courses)
    db
      .select({
        courseId: purchases.courseId,
        totalRevenue: sql<number>`coalesce(sum(${purchases.amount}), 0)`,
      })
      .from(purchases)
      .innerJoin(courses, eq(purchases.courseId, courses.id))
      .where(eq(courses.status, "PUBLISHED"))
      .groupBy(purchases.courseId)
      .orderBy(desc(sql`coalesce(sum(${purchases.amount}), 0)`)),

    // Progress data: completed lessons per user for this course
    lessonIds.length > 0
      ? db
          .select({
            userId: userProgress.userId,
            completedLessons: sql<number>`cast(sum(case when ${userProgress.isCompleted} = true then 1 else 0 end) as integer)`,
          })
          .from(userProgress)
          .where(inArray(userProgress.lessonId, lessonIds))
          .groupBy(userProgress.userId)
      : Promise.resolve([]),
  ]);

  // Process monthly data into chart format
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
  const now = new Date();

  const revenueByMonth: Array<{ month: string; value: number }> = [];
  const enrollmentsByMonth: Array<{ month: string; value: number }> = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = monthNames[d.getMonth()];

    const revMatch = monthlyRevenueData.find(
      (m) =>
        Number(m.monthNum) === d.getMonth() + 1 &&
        Number(m.year) === d.getFullYear(),
    );
    revenueByMonth.push({
      month: label,
      value: revMatch ? Number(revMatch.revenue) : 0,
    });

    const enrMatch = monthlyEnrollmentData.find(
      (m) =>
        Number(m.monthNum) === d.getMonth() + 1 &&
        Number(m.year) === d.getFullYear(),
    );
    enrollmentsByMonth.push({
      month: label,
      value: enrMatch ? Number(enrMatch.enrollments) : 0,
    });
  }

  // Process course ranking
  const totalPublishedCourses = courseRankingData.length;
  const rankIndex = courseRankingData.findIndex((r) => r.courseId === courseId);
  const courseRanking = {
    rank: rankIndex >= 0 ? rankIndex + 1 : totalPublishedCourses + 1,
    totalCourses: Math.max(totalPublishedCourses, 1),
  };

  // Process completion rate & active enrollments
  const totalStudents = studentsResult[0]?.count ?? 0;
  const totalLessons = lessonIds.length;
  let completedStudents = 0;

  if (totalLessons > 0 && progressData.length > 0) {
    completedStudents = progressData.filter(
      (p) => p.completedLessons >= totalLessons,
    ).length;
  }

  const completionRate =
    totalStudents > 0
      ? Math.round((completedStudents / totalStudents) * 100)
      : 0;
  const activeEnrollments = totalStudents - completedStudents;

  // Process assignment submissions
  const assignmentStatusMap = new Map(
    assignmentResult.map((r) => [r.status, r.count]),
  );
  const assignmentSubs = {
    pending: assignmentStatusMap.get("PENDING") ?? 0,
    graded: assignmentStatusMap.get("GRADED") ?? 0,
    rejected: assignmentStatusMap.get("REJECTED") ?? 0,
    total: Array.from(assignmentStatusMap.values()).reduce((a, b) => a + b, 0),
  };

  // Process quiz stats
  const quizStats = quizResult[0];
  const avgQuizScore = quizStats?.avgScore
    ? Math.round(Number(quizStats.avgScore))
    : null;
  const quizPassRate =
    quizStats && quizStats.totalAttempts > 0
      ? Math.round(
          ((quizStats.passedCount ?? 0) / quizStats.totalAttempts) * 100,
        )
      : null;

  return {
    data: {
      request: {
        id: request.id,
        type: request.type,
        reason: request.reason,
        status: request.status,
        createdAt: request.createdAt,
      },
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        imageUrl: course.imageUrl,
        price: course.price,
        status: course.status,
        tags: course.tags,
        createdAt: course.createdAt,
      },
      tutor: tutor
        ? {
            id: tutor.id,
            firstName: tutor.firstName,
            lastName: tutor.lastName,
            email: tutor.email,
            imageUrl: tutor.imageUrl,
          }
        : null,
      analytics: {
        totalStudents,
        totalRevenue: Number(revenueResult[0]?.total) || 0,
        totalReviews: reviewsResult[0]?.count ?? 0,
        averageRating: reviewsResult[0]?.avgRating
          ? Math.round(Number(reviewsResult[0].avgRating) * 10) / 10
          : null,
        totalLikes: likesResult[0]?.count ?? 0,
        completionRate,
        activeEnrollments,
        completedStudents,
        certificatesIssued: certificatesResult[0]?.count ?? 0,
        avgQuizScore,
        quizPassRate,
        totalQuizAttempts: quizStats?.totalAttempts ?? 0,
        assignmentSubmissions: assignmentSubs,
        courseRanking,
        revenueByMonth,
        enrollmentsByMonth,
      },
    },
  };
}

// ─── Archive Course (Soft Delete) ────────────────────────────────────────────────

export async function archiveCourse(
  requestId: string,
): Promise<{ success?: boolean; error?: string }> {
  try {
    await assertOrgAdmin();
  } catch {
    return { error: "Unauthorized" };
  }

  const request = await db.query.courseRequests.findFirst({
    where: eq(courseRequests.id, requestId),
  });

  if (!request || request.type !== "DELETE" || request.status !== "PENDING") {
    return { error: "Invalid or already resolved request" };
  }

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, request.courseId),
  });

  if (!course) return { error: "Course not found" };

  try {
    // 1. Set course status to ARCHIVED
    await db
      .update(courses)
      .set({ status: "ARCHIVED" })
      .where(eq(courses.id, request.courseId));

    // 2. Mark request as APPROVED
    await db
      .update(courseRequests)
      .set({ status: "APPROVED", resolvedAt: new Date() })
      .where(eq(courseRequests.id, requestId));

    revalidatePath("/org/requests");
    revalidatePath("/org/courses");
    revalidatePath(`/tutor/courses/${request.courseId}`);
    revalidatePath("/tutor/courses");
    return { success: true };
  } catch (error) {
    console.error("Failed to archive course:", error);
    return { error: "Failed to archive course" };
  }
}

// ─── Permanently Delete Course (Hard Delete) ────────────────────────────────────

export async function permanentlyDeleteCourse(
  requestId: string,
): Promise<{ success?: boolean; error?: string }> {
  try {
    await assertOrgAdmin();
  } catch {
    return { error: "Unauthorized" };
  }

  const request = await db.query.courseRequests.findFirst({
    where: eq(courseRequests.id, requestId),
  });

  if (!request || request.type !== "DELETE" || request.status !== "PENDING") {
    return { error: "Invalid or already resolved request" };
  }

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, request.courseId),
  });

  if (!course) return { error: "Course not found" };

  try {
    // 1. Mark request as APPROVED first (before cascade deletes the request too)
    await db
      .update(courseRequests)
      .set({ status: "APPROVED", resolvedAt: new Date() })
      .where(eq(courseRequests.id, requestId));

    // 2. Hard delete the course — cascades to all related data
    await db.delete(courses).where(eq(courses.id, request.courseId));

    revalidatePath("/org/requests");
    revalidatePath("/org/courses");
    revalidatePath(`/tutor/courses/${request.courseId}`);
    revalidatePath("/tutor/courses");
    return { success: true };
  } catch (error) {
    console.error("Failed to permanently delete course:", error);
    return { error: "Failed to permanently delete course" };
  }
}
