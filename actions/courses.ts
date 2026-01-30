"use server";

import { db } from "@/lib/db";
import { courses, users } from "@/drizzle/schema";
import { eq, desc, count, and, or, ilike } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

// Types
export interface CourseWithTutor {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  isPublished: boolean | null;
  imageUrl: string | null;
  createdAt: Date;
  tutor: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  } | null;
}

export interface PaginatedCoursesResult {
  courses: CourseWithTutor[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Get courses for the current tutor (paginated)
export async function getTutorCourses(
  page: number = 1,
  limit: number = 20,
  search?: string,
): Promise<PaginatedCoursesResult> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Get the tutor's database ID from their clerkId
  const tutor = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!tutor || tutor.role !== "TUTOR") {
    throw new Error("Not a tutor");
  }

  const offset = (page - 1) * limit;

  // Build where clause
  const whereClause = search
    ? and(
        eq(courses.tutorId, tutor.id),
        or(
          ilike(courses.title, `%${search}%`),
          ilike(courses.description, `%${search}%`),
        ),
      )
    : eq(courses.tutorId, tutor.id);

  // Get total count
  const [countResult] = await db
    .select({ count: count() })
    .from(courses)
    .where(whereClause);

  const totalCount = countResult?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  // Get courses with tutor info
  const coursesData = await db
    .select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
      price: courses.price,
      isPublished: courses.isPublished,
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

// Get all courses (for admin, paginated)
export async function getAllCourses(
  page: number = 1,
  limit: number = 20,
  search?: string,
  publishedOnly: boolean = false,
): Promise<PaginatedCoursesResult> {
  const { sessionClaims } = await auth();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const role = sessionClaims?.metadata?.role;

  if (role !== "ORG_ADMIN" && role !== "TUTOR") {
    throw new Error("Unauthorized");
  }

  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions = [];
  if (search) {
    // Search across title, description, and tutor names
    conditions.push(
      or(
        ilike(courses.title, `%${search}%`),
        ilike(courses.description, `%${search}%`),
      ),
    );
  }
  if (publishedOnly) {
    conditions.push(eq(courses.isPublished, true));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const [countResult] = await db
    .select({ count: count() })
    .from(courses)
    .where(whereClause);

  const totalCount = countResult?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  // Get courses with tutor info
  const coursesData = await db
    .select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
      price: courses.price,
      isPublished: courses.isPublished,
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

// Get a single course by ID
export async function getCourseById(courseId: string) {
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    with: {
      tutor: true,
      chapters: {
        orderBy: (chapters, { asc }) => [asc(chapters.position)],
        with: {
          lessons: {
            orderBy: (lessons, { asc }) => [asc(lessons.position)],
          },
        },
      },
    },
  });

  return course;
}

// Create a new course
export async function createCourse(data: {
  title: string;
  description?: string;
  price?: number;
  imageUrl?: string;
}) {
  const { userId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  // Get the tutor's database ID
  const tutor = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!tutor || tutor.role !== "TUTOR") {
    return { error: "Not a tutor" };
  }

  try {
    const [newCourse] = await db
      .insert(courses)
      .values({
        title: data.title,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        tutorId: tutor.id,
        isPublished: false,
      })
      .returning();

    return { success: true, course: newCourse };
  } catch (error) {
    console.error("Error creating course:", error);
    return { error: "Failed to create course" };
  }
}

// Update a course
export async function updateCourse(
  courseId: string,
  data: {
    title?: string;
    description?: string;
    price?: number;
    imageUrl?: string;
    isPublished?: boolean;
  },
) {
  const { userId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  // Get the tutor's database ID
  const tutor = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!tutor) {
    return { error: "User not found" };
  }

  // Get the course to verify ownership
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  });

  if (!course) {
    return { error: "Course not found" };
  }

  // Only the owner or admin can update
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const role = (await auth()).sessionClaims?.metadata?.role;
  if (course.tutorId !== tutor.id && role !== "ORG_ADMIN") {
    return { error: "Not authorized to update this course" };
  }

  try {
    const [updatedCourse] = await db
      .update(courses)
      .set(data)
      .where(eq(courses.id, courseId))
      .returning();

    return { success: true, course: updatedCourse };
  } catch (error) {
    console.error("Error updating course:", error);
    return { error: "Failed to update course" };
  }
}

// Delete a course
export async function deleteCourse(courseId: string) {
  const { userId } = await auth();

  if (!userId) {
    return { error: "Unauthorized" };
  }

  // Get the tutor's database ID
  const tutor = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!tutor) {
    return { error: "User not found" };
  }

  // Get the course to verify ownership
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  });

  if (!course) {
    return { error: "Course not found" };
  }

  // Only the owner or admin can delete
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const role = (await auth()).sessionClaims?.metadata?.role;
  if (course.tutorId !== tutor.id && role !== "ORG_ADMIN") {
    return { error: "Not authorized to delete this course" };
  }

  try {
    await db.delete(courses).where(eq(courses.id, courseId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting course:", error);
    return { error: "Failed to delete course" };
  }
}
