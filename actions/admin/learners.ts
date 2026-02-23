"use server";

import { db } from "@/lib/db";
import { users, courses, purchases } from "@/drizzle/schema";
import { eq, desc, and, count, sql, aliasedTable } from "drizzle-orm";
import { checkAdmin } from "./auth";

export async function getLearners(page: number = 1, limit: number = 20) {
  await checkAdmin();

  const offset = (page - 1) * limit;

  const [totalResult] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.role, "LEARNER"));

  const learners = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      imageUrl: users.imageUrl,
      status: users.status,
      createdAt: users.createdAt,
      coursesPurchased: sql<number>`cast(count(distinct ${purchases.id}) as integer)`,
      totalSpent: sql<number>`coalesce(sum(${purchases.amount}), 0)`,
    })
    .from(users)
    .leftJoin(purchases, eq(users.id, purchases.userId))
    .where(eq(users.role, "LEARNER"))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    learners,
    totalCount: totalResult?.count ?? 0,
    totalPages: Math.ceil((totalResult?.count ?? 0) / limit),
    currentPage: page,
  };
}

export async function getLearnerById(learnerId: string) {
  await checkAdmin();

  const learner = await db.query.users.findFirst({
    where: and(eq(users.id, learnerId), eq(users.role, "LEARNER")),
  });

  if (!learner) return null;

  const tutors = aliasedTable(users, "tutor");

  const purchasedCourses = await db
    .select({
      purchaseId: purchases.id,
      courseId: courses.id,
      courseTitle: courses.title,
      courseImageUrl: courses.imageUrl,
      coursePrice: courses.price,
      tutorFirstName: tutors.firstName,
      tutorLastName: tutors.lastName,
      purchaseAmount: purchases.amount,
      purchasedAt: purchases.createdAt,
    })
    .from(purchases)
    .innerJoin(courses, eq(purchases.courseId, courses.id))
    .leftJoin(tutors, eq(courses.tutorId, tutors.id))
    .where(eq(purchases.userId, learnerId))
    .orderBy(desc(purchases.createdAt));

  const totalSpent = purchasedCourses.reduce(
    (sum, p) => sum + (p.purchaseAmount ?? 0),
    0,
  );

  return {
    ...learner,
    purchasedCourses,
    totalSpent,
    totalCourses: purchasedCourses.length,
  };
}
