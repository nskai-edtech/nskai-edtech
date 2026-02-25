"use server";

import { db } from "@/lib/db";
import { courses, courseRequests, users } from "@/drizzle/schema";
import { eq, desc, count, ilike, or, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function getAdminCourseRequests(
  page = 1,
  limit = 20,
  search?: string,
) {
  const { sessionClaims } = await auth();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN")
    throw new Error("Unauthorized");

  const offset = (page - 1) * limit;

  const conditions = [];
  if (search) {
    conditions.push(
      or(
        ilike(courses.title, `%${search}%`),
        ilike(users.firstName, `%${search}%`),
        ilike(users.lastName, `%${search}%`),
      ),
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db
    .select({ count: count() })
    .from(courseRequests)
    .innerJoin(courses, eq(courseRequests.courseId, courses.id))
    .innerJoin(users, eq(courseRequests.userId, users.id))
    .where(whereClause);

  const totalCount = countResult?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  const data = await db
    .select({
      id: courseRequests.id,
      type: courseRequests.type,
      reason: courseRequests.reason,
      status: courseRequests.status,
      createdAt: courseRequests.createdAt,
      resolvedAt: courseRequests.resolvedAt,
      course: {
        id: courses.id,
        title: courses.title,
        status: courses.status,
      },
      tutor: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        imageUrl: users.imageUrl,
      },
    })
    .from(courseRequests)
    .innerJoin(courses, eq(courseRequests.courseId, courses.id))
    .innerJoin(users, eq(courseRequests.userId, users.id))
    .where(whereClause)
    .orderBy(desc(courseRequests.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    requests: data,
    totalCount,
    totalPages,
    currentPage: page,
  };
}
