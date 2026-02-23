"use server";

import { db } from "@/lib/db";
import { users, courses } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { TutorAnalytics } from "./types";
import {
  fetchKPIs,
  fetchMonthlyTrends,
  fetchCoursePerformance,
  fetchRecentEnrollments,
  fetchQuizPerformance,
} from "./queries";

export async function getTutorAnalytics(): Promise<
  { error: string } | TutorAnalytics
> {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });
    if (!user) return { error: "User not found" };

    // 1. Get tutor courses
    const tutorCourses = await db.query.courses.findMany({
      where: eq(courses.tutorId, user.id),
      orderBy: [desc(courses.createdAt)],
    });

    // Handle edge case: No courses yet
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

    // 🔥 BUG SQUASHED: Replaced 'isPublished' with the new schema status
    const publishedCourses = tutorCourses.filter(
      (c) => c.status === "PUBLISHED",
    ).length;

    // 2. Fetch all data concurrently for maximum speed
    const [kpis, monthly, performance, recent, quizzes] = await Promise.all([
      fetchKPIs(courseIds),
      fetchMonthlyTrends(courseIds),
      fetchCoursePerformance(courseIds, tutorCourses),
      fetchRecentEnrollments(courseIds),
      fetchQuizPerformance(courseIds),
    ]);

    // 3. Assemble and return
    return {
      totalRevenue: kpis.totalRevenue,
      totalStudents: kpis.totalStudents,
      avgQuizScore: kpis.avgQuizScore,
      publishedCourses,
      totalCourses: tutorCourses.length,
      revenueByMonth: monthly.revenueByMonth,
      enrollmentsByMonth: monthly.enrollmentsByMonth,
      courses: performance,
      recentEnrollments: recent,
      quizPerformance: quizzes,
    };
  } catch (error) {
    console.error("[GET_TUTOR_ANALYTICS]", error);
    return { error: "Failed to fetch analytics" };
  }
}
