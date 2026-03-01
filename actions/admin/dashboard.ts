"use server";

import { db } from "@/lib/db";
import { users, courses, purchases, courseRequests } from "@/drizzle/schema";
import { eq, desc, and, count, sql, aliasedTable } from "drizzle-orm";
import { checkAdmin } from "./auth";

export async function getAdminPendingCounts() {
  await checkAdmin();

  const [pendingCourses] = await db
    .select({ count: count() })
    .from(courses)
    .where(eq(courses.status, "PENDING"));

  const [pendingTutors] = await db
    .select({ count: count() })
    .from(users)
    .where(and(eq(users.role, "TUTOR"), eq(users.status, "PENDING")));

  const [pendingRequests] = await db
    .select({ count: count() })
    .from(courseRequests)
    .where(eq(courseRequests.status, "PENDING"));

  return {
    pendingCourses: pendingCourses?.count ?? 0,
    pendingTutors: pendingTutors?.count ?? 0,
    pendingRequests: pendingRequests?.count ?? 0,
  };
}

export async function getOrgOverviewStats() {
  await checkAdmin();

  const [revenueResult] = await db
    .select({ total: sql<number>`coalesce(sum(${purchases.amount}), 0)` })
    .from(purchases);

  const [learnerResult] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.role, "LEARNER"));

  const [tutorResult] = await db
    .select({ count: count() })
    .from(users)
    .where(and(eq(users.role, "TUTOR"), eq(users.status, "ACTIVE")));

  const [courseResult] = await db
    .select({ count: count() })
    .from(courses)
    .where(eq(courses.status, "PUBLISHED"));

  return {
    totalRevenue: revenueResult?.total ?? 0,
    totalLearners: learnerResult?.count ?? 0,
    activeTutors: tutorResult?.count ?? 0,
    publishedCourses: courseResult?.count ?? 0,
  };
}

export async function getRecentPendingActivity() {
  await checkAdmin();

  const pendingTutors = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      expertise: users.expertise,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(and(eq(users.role, "TUTOR"), eq(users.status, "PENDING")))
    .orderBy(desc(users.createdAt))
    .limit(5);

  const tutors = aliasedTable(users, "tutor");
  const pendingCourses = await db
    .select({
      id: courses.id,
      title: courses.title,
      createdAt: courses.createdAt,
      tutorFirstName: tutors.firstName,
      tutorLastName: tutors.lastName,
    })
    .from(courses)
    .leftJoin(tutors, eq(courses.tutorId, tutors.id))
    .where(eq(courses.status, "PENDING"))
    .orderBy(desc(courses.createdAt))
    .limit(5);

  return { pendingTutors, pendingCourses };
}
