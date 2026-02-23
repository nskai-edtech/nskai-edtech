/* eslint-disable @typescript-eslint/ban-ts-comment */
"use server";

import { db } from "@/lib/db";
import { courses, users, chapters, lessons } from "@/drizzle/schema";
import { eq, desc, count, and, or, ilike } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { PaginatedCoursesResult } from "./types";

export async function getAllCourses(
  page = 1,
  limit = 20,
  search?: string,
  publishedOnly = false,
): Promise<PaginatedCoursesResult> {
  const { sessionClaims } = await auth();
  // @ts-ignore
  const role = sessionClaims?.metadata?.role;
  if (role !== "ORG_ADMIN" && role !== "TUTOR") throw new Error("Unauthorized");

  const offset = (page - 1) * limit;
  const conditions = [];

  if (search)
    conditions.push(
      or(
        ilike(courses.title, `%${search}%`),
        ilike(courses.description, `%${search}%`),
      ),
    );
  if (publishedOnly) conditions.push(eq(courses.status, "PUBLISHED"));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
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

export async function getPendingCourses() {
  const { sessionClaims } = await auth();
  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN")
    throw new Error("Unauthorized");

  return await db.query.courses.findMany({
    where: eq(courses.status, "PENDING"),
    with: { tutor: true, chapters: { with: { lessons: true } } },
    orderBy: [desc(courses.createdAt)],
  });
}

export async function getCourseReviewData(courseId: string) {
  const { sessionClaims } = await auth();
  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN")
    throw new Error("Unauthorized");

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    with: {
      tutor: true,
      chapters: {
        orderBy: (chapters, { asc }) => [asc(chapters.position)],
        limit: 1,
        with: {
          lessons: {
            orderBy: (lessons, { asc }) => [asc(lessons.position)],
            limit: 5,
            with: { muxData: true },
          },
        },
      },
    },
  });

  if (!course) return null;

  const [chaptersCount] = await db
    .select({ count: count() })
    .from(chapters)
    .where(eq(chapters.courseId, courseId));
  const [lessonsCount] = await db
    .select({ count: count() })
    .from(lessons)
    .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
    .where(eq(chapters.courseId, courseId));

  return {
    ...course,
    totalModules: chaptersCount?.count ?? 0,
    totalLessons: lessonsCount?.count ?? 0,
  };
}

async function updateCourseStatus(
  courseId: string,
  status: "PUBLISHED" | "REJECTED",
) {
  const { sessionClaims } = await auth();
  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN")
    return { error: "Unauthorized" };

  try {
    await db.update(courses).set({ status }).where(eq(courses.id, courseId));

    const paths = [
      "/org/approvals",
      "/org",
      "/tutor/courses",
      `/tutor/courses/${courseId}`,
      "/learner/marketplace",
      "/",
    ];
    paths.forEach((p) => revalidatePath(p));

    return { success: true };
  } catch (error) {
    console.error("Failed to update course status:", error);
    return { error: `Failed to ${status.toLowerCase()} course` };
  }
}

export async function approveCourse(courseId: string) {
  return updateCourseStatus(courseId, "PUBLISHED");
}
export async function rejectCourse(courseId: string) {
  return updateCourseStatus(courseId, "REJECTED");
}
