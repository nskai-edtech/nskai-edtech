"use server";

import { db } from "@/lib/db";
import { courses, users, purchases, chapters, lessons } from "@/drizzle/schema";
import { eq, desc, count, and, or, ilike, SQL, not } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Types
export interface CourseWithTutor {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  isPublished: boolean | null;
  status: "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED";
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

// Get all courses (for admin, paginated)
export async function getAllCourses(
  page: number = 1,
  limit: number = 20,
  search?: string,
  publishedOnly: boolean = false,
): Promise<PaginatedCoursesResult> {
  const { sessionClaims } = await auth();
  const role = (sessionClaims as { metadata?: { role?: string } })?.metadata
    ?.role;

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

// Get all published courses for the marketplace (paginated)
export async function getMarketplaceCourses(
  page: number = 1,
  limit: number = 20,
  search?: string,
): Promise<PaginatedCoursesResult> {
  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions: (SQL | undefined)[] = [eq(courses.isPublished, true)];
  if (search) {
    conditions.push(
      or(
        ilike(courses.title, `%${search}%`),
        ilike(courses.description, `%${search}%`),
      ),
    );
  }

  const whereClause = and(...conditions);

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

// Get courses enrolled by the current user
export async function getEnrolledCourses() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Get the learner's database ID
  const student = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!student) {
    throw new Error("User not found");
  }

  // Fetch courses joined with purchases
  const enrolledCourses = await db
    .select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
      price: courses.price,
      isPublished: courses.isPublished,
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
    .innerJoin(purchases, eq(courses.id, purchases.courseId))
    .leftJoin(users, eq(courses.tutorId, users.id))
    .where(eq(purchases.userId, student.id))
    .orderBy(desc(purchases.createdAt));

  return enrolledCourses as CourseWithTutor[];
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
            with: {
              muxData: true,
            },
          },
        },
      },
    },
  });

  return course;
}

// Create a new course
// Get just the status of a course (for polling)
export async function getCourseStatus(courseId: string) {
  try {
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      columns: {
        status: true,
      },
    });

    return { status: course?.status || null };
  } catch (error) {
    console.error("Error getting course status:", error);
    return { error: "Failed to get course status" };
  }
}

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

  console.log("[CREATE_COURSE] Data received:", data);
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

    console.log("[CREATE_COURSE] Success:", newCourse);
    revalidatePath("/tutor/courses");
    return { success: true, course: newCourse };
  } catch (error) {
    console.error("[CREATE_COURSE] Error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to create course",
    };
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
  const { sessionClaims } = await auth();
  const role = (sessionClaims as { metadata?: { role?: string } })?.metadata
    ?.role;
  if (course.tutorId !== tutor.id && role !== "ORG_ADMIN") {
    return { error: "Not authorized to update this course" };
  }

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
  const { sessionClaims } = await auth();
  const role = (sessionClaims as { metadata?: { role?: string } })?.metadata
    ?.role;
  if (course.tutorId !== tutor.id && role !== "ORG_ADMIN") {
    return { error: "Not authorized to delete this course" };
  }

  try {
    await db.delete(courses).where(eq(courses.id, courseId));

    revalidatePath("/tutor/courses");
    return { success: true };
  } catch (error) {
    console.error("Error deleting course:", error);
    return { error: "Failed to delete course" };
  }
}

// Get related courses (same tutor + other published courses)
export async function getRelatedCourses(courseId: string, tutorId: string) {
  // 1. Get other courses by the same tutor
  const tutorCourses = await db
    .select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
      price: courses.price,
      isPublished: courses.isPublished,
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
        eq(courses.isPublished, true),
        not(eq(courses.id, courseId)),
      ),
    )
    .limit(3);

  // 2. Get other published courses to fill up
  const otherCoursesCount = 6 - tutorCourses.length;
  let otherCourses: CourseWithTutor[] = [];

  if (otherCoursesCount > 0) {
    otherCourses = (await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        price: courses.price,
        isPublished: courses.isPublished,
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
          eq(courses.isPublished, true),
          not(eq(courses.id, courseId)),
          not(eq(courses.tutorId, tutorId)),
        ),
      )
      .limit(otherCoursesCount)) as CourseWithTutor[];
  }

  return [...tutorCourses, ...otherCourses];
}

// Check if a user is enrolled in a course
export async function checkEnrollment(courseId: string) {
  const { userId } = await auth();
  if (!userId) return false;

  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!dbUser) return false;

  const purchase = await db.query.purchases.findFirst({
    where: and(
      eq(purchases.courseId, courseId),
      eq(purchases.userId, dbUser.id),
    ),
  });

  return !!purchase;
}
// Submit a course for review
export async function submitCourseForReview(courseId: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const tutor = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!tutor) return { error: "User not found" };

  try {
    await db
      .update(courses)
      .set({ status: "PENDING" })
      .where(and(eq(courses.id, courseId), eq(courses.tutorId, tutor.id)));

    revalidatePath("/tutor/courses");
    revalidatePath(`/tutor/courses/${courseId}`);
    revalidatePath("/org/approvals");
    revalidatePath("/org");

    return { success: true };
  } catch (error) {
    console.error("Error submitting course for review:", error);
    return { error: "Failed to submit course" };
  }
}

// Get all pending courses (for admin)
export async function getPendingCourses() {
  const { sessionClaims } = await auth();
  const role = (sessionClaims as { metadata?: { role?: string } })?.metadata
    ?.role;

  if (role !== "ORG_ADMIN") {
    throw new Error("Unauthorized");
  }

  const pendingCourses = await db.query.courses.findMany({
    where: eq(courses.status, "PENDING"),
    with: {
      tutor: true,
      chapters: {
        with: {
          lessons: true,
        },
      },
    },
    orderBy: [desc(courses.createdAt)],
  });

  return pendingCourses;
}

// Get specialized review data for a course
export async function getCourseReviewData(courseId: string) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims as { metadata?: { role?: string } })?.metadata
    ?.role;

  if (role !== "ORG_ADMIN") {
    throw new Error("Unauthorized");
  }

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    with: {
      tutor: true,
      chapters: {
        orderBy: (chapters, { asc }) => [asc(chapters.position)],
        limit: 1, // Only 1 module
        with: {
          lessons: {
            orderBy: (lessons, { asc }) => [asc(lessons.position)],
            limit: 5, // Max 5 lessons with videos
            with: {
              muxData: true,
            },
          },
        },
      },
    },
  });

  if (!course) return null;

  // Fetch total counts separately to keep it efficient
  const [chaptersCount] = await db
    .select({ count: count() })
    .from(chapters)
    .where(eq(chapters.courseId, courseId));

  const lessonsCount = await db
    .select({ count: count() })
    .from(lessons)
    .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
    .where(eq(chapters.courseId, courseId));

  return {
    ...course,
    totalModules: chaptersCount?.count ?? 0,
    totalLessons: lessonsCount?.[0]?.count ?? 0,
  };
}

// Approve a course
export async function approveCourse(courseId: string) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims as { metadata?: { role?: string } })?.metadata
    ?.role;

  if (role !== "ORG_ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    await db
      .update(courses)
      .set({
        status: "PUBLISHED",
        isPublished: true,
      })
      .where(eq(courses.id, courseId));

    revalidatePath("/org/approvals");
    revalidatePath("/org");
    revalidatePath("/tutor/courses");
    revalidatePath(`/tutor/courses/${courseId}`);
    revalidatePath("/learner/marketplace");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error approving course:", error);
    return { error: "Failed to approve course" };
  }
}

// Reject a course
export async function rejectCourse(courseId: string) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims as { metadata?: { role?: string } })?.metadata
    ?.role;

  if (role !== "ORG_ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    await db
      .update(courses)
      .set({ status: "REJECTED" })
      .where(eq(courses.id, courseId));

    revalidatePath("/org/approvals");
    revalidatePath("/org");
    revalidatePath("/tutor/courses");
    revalidatePath(`/tutor/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Error rejecting course:", error);
    return { error: "Failed to reject course" };
  }
}
