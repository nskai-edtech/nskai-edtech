/* eslint-disable @typescript-eslint/ban-ts-comment */
"use server";

import { db } from "@/lib/db";
import { courses, users, purchases } from "@/drizzle/schema";
import { eq, desc, count, and, or, ilike, sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { PaginatedCoursesResult } from "./types";

export async function getTutorCourses(
  page = 1,
  limit = 20,
  search?: string,
): Promise<PaginatedCoursesResult> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const tutor = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  if (!tutor || tutor.role !== "TUTOR") throw new Error("Not a tutor");

  const offset = (page - 1) * limit;
  const whereClause = search
    ? and(
        eq(courses.tutorId, tutor.id),
        or(
          ilike(courses.title, `%${search}%`),
          ilike(courses.description, `%${search}%`),
        ),
      )
    : eq(courses.tutorId, tutor.id);

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

export async function createCourse(data: {
  title: string;
  description?: string;
  price?: number;
  imageUrl?: string;
}) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const tutor = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  if (!tutor || tutor.role !== "TUTOR") return { error: "Not a tutor" };

  try {
    const [newCourse] = await db
      .insert(courses)
      .values({
        title: data.title,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        tutorId: tutor.id,
        status: "DRAFT",
      })
      .returning();

    revalidatePath("/tutor/courses");
    return { success: true, course: newCourse };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to create course",
    };
  }
}

export async function updateCourse(
  courseId: string,
  data: {
    title?: string;
    description?: string;
    price?: number;
    imageUrl?: string;
    status?: "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED";
  },
) {
  const { userId, sessionClaims } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  if (!user) return { error: "User not found" };

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  });
  if (!course) return { error: "Course not found" };

  // @ts-ignore
  const role = sessionClaims?.metadata?.role;
  if (course.tutorId !== user.id && role !== "ORG_ADMIN")
    return { error: "Not authorized" };

  try {
    const [updatedCourse] = await db
      .update(courses)
      .set(data)
      .where(eq(courses.id, courseId))
      .returning();
    revalidatePath("/tutor/courses");
    revalidatePath(`/tutor/courses/${courseId}`);
    return { success: true, course: updatedCourse };
  } catch (error) {
    console.error("Failed to update course:", error);
    return { error: "Failed to update course" };
  }
}

export async function deleteCourse(courseId: string) {
  const { userId, sessionClaims } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  if (!user) return { error: "User not found" };

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  });
  if (!course) return { error: "Course not found" };

  // @ts-ignore
  const role = sessionClaims?.metadata?.role;
  if (course.tutorId !== user.id && role !== "ORG_ADMIN")
    return { error: "Not authorized" };

  try {
    await db.delete(courses).where(eq(courses.id, courseId));
    revalidatePath("/tutor/courses");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete course:", error);
    return { error: "Failed to delete course" };
  }
}

export async function submitCourseForReview(courseId: string) {
  return updateCourse(courseId, { status: "PENDING" });
}

export async function getTutorDashboardStats() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const tutor = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  if (!tutor || tutor.role !== "TUTOR") throw new Error("Not a tutor");

  const [revenueResult] = await db
    .select({ total: sql<number>`coalesce(sum(${purchases.amount}), 0)` })
    .from(purchases)
    .innerJoin(courses, eq(purchases.courseId, courses.id))
    .where(eq(courses.tutorId, tutor.id));

  const [studentsResult] = await db
    .select({
      count: sql<number>`cast(count(distinct ${purchases.userId}) as integer)`,
    })
    .from(purchases)
    .innerJoin(courses, eq(purchases.courseId, courses.id))
    .where(eq(courses.tutorId, tutor.id));

  const [coursesResult] = await db
    .select({ count: count() })
    .from(courses)
    .where(eq(courses.tutorId, tutor.id));

  const topCourses = await db
    .select({
      id: courses.id,
      title: courses.title,
      price: courses.price,
      imageUrl: courses.imageUrl,
      revenue: sql<number>`coalesce(sum(${purchases.amount}), 0)`,
      students: sql<number>`cast(count(distinct ${purchases.userId}) as integer)`,
    })
    .from(courses)
    .leftJoin(purchases, eq(courses.id, purchases.courseId))
    .where(eq(courses.tutorId, tutor.id))
    .groupBy(courses.id)
    .orderBy(desc(sql`coalesce(sum(${purchases.amount}), 0)`))
    .limit(4);

  return {
    totalRevenue: revenueResult?.total ?? 0,
    totalStudents: studentsResult?.count ?? 0,
    totalCourses: coursesResult?.count ?? 0,
    topCourses,
  };
}
