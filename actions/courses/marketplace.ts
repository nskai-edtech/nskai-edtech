"use server";

import { db } from "@/lib/db";
import { courses, users } from "@/drizzle/schema";
import { eq, desc, count, and, or, ilike, not, SQL } from "drizzle-orm";
import { CourseWithTutor, PaginatedCoursesResult } from "./types";

export async function getMarketplaceCourses(
  page = 1,
  limit = 20,
  search?: string,
): Promise<PaginatedCoursesResult> {
  const offset = (page - 1) * limit;

  const conditions: (SQL | undefined)[] = [eq(courses.status, "PUBLISHED")];
  if (search) {
    conditions.push(
      or(
        ilike(courses.title, `%${search}%`),
        ilike(courses.description, `%${search}%`),
      ),
    );
  }

  const whereClause = and(...conditions);
  const [countResult] = await db
    .select({ count: count() })
    .from(courses)
    .where(whereClause);
  const totalCount = countResult?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  const coursesData = await db
    .select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
      price: courses.price,
      status: courses.status,
      imageUrl: courses.imageUrl,
      createdAt: courses.createdAt,
      tutor: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        imageUrl: users.imageUrl,
      },
    })
    .from(courses)
    .leftJoin(users, eq(courses.tutorId, users.id))
    .where(whereClause)
    .orderBy(desc(courses.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    courses: coursesData,
    totalCount,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export async function getCourseById(courseId: string) {
  return await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    with: {
      tutor: true,
      chapters: {
        orderBy: (chapters, { asc }) => [asc(chapters.position)],
        with: {
          lessons: {
            orderBy: (lessons, { asc }) => [asc(lessons.position)],
            with: { muxData: true, assignment: true },
          },
        },
      },
    },
  });
}

export async function getCourseStatus(courseId: string) {
  try {
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      columns: { status: true },
    });
    return { status: course?.status || null };
  } catch (error) {
    console.error("Failed to get course status:", error);
    return { error: "Failed to get course status" };
  }
}

export async function getRelatedCourses(courseId: string, tutorId: string) {
  const tutorCourses = await db
    .select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
      price: courses.price,
      status: courses.status,
      imageUrl: courses.imageUrl,
      createdAt: courses.createdAt,
      tutor: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        imageUrl: users.imageUrl,
      },
    })
    .from(courses)
    .leftJoin(users, eq(courses.tutorId, users.id))
    .where(
      and(
        eq(courses.tutorId, tutorId),
        eq(courses.status, "PUBLISHED"),
        not(eq(courses.id, courseId)),
      ),
    )
    .limit(3);

  const otherCoursesCount = 6 - tutorCourses.length;
  let otherCourses: CourseWithTutor[] = [];

  if (otherCoursesCount > 0) {
    otherCourses = (await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        price: courses.price,
        status: courses.status,
        imageUrl: courses.imageUrl,
        createdAt: courses.createdAt,
        tutor: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          imageUrl: users.imageUrl,
        },
      })
      .from(courses)
      .leftJoin(users, eq(courses.tutorId, users.id))
      .where(
        and(
          eq(courses.status, "PUBLISHED"),
          not(eq(courses.id, courseId)),
          not(eq(courses.tutorId, tutorId)),
        ),
      )
      .limit(otherCoursesCount)) as CourseWithTutor[];
  }

  return [...tutorCourses, ...otherCourses];
}
