"use server";

import { db } from "@/lib/db";
import {
  learningPaths,
  learningPathCourses,
  courses,
  users,
  userLearningPaths,
} from "@/drizzle/schema";
import { eq, desc, and, ilike } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { chapters, lessons } from "@/drizzle/schema";

export async function createLearningPath(title: string, description: string) {
  try {
    const { sessionClaims } = await auth();
    if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
      throw new Error("Unauthorized");
    }

    const [newPath] = await db
      .insert(learningPaths)
      .values({
        title,
        description,
        isPublished: false,
      })
      .returning();

    return { success: true, path: newPath };
  } catch (error) {
    console.error("[CREATE_LEARNING_PATH]", error);
    return { success: false, error: "Failed to create learning path" };
  }
}

export async function getAdminLearningPaths() {
  try {
    const { sessionClaims } = await auth();
    if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
      throw new Error("Unauthorized");
    }

    const paths = await db.query.learningPaths.findMany({
      orderBy: [desc(learningPaths.createdAt)],
    });

    return paths;
  } catch (error) {
    console.error("[GET_ADMIN_LEARNING_PATHS]", error);
    return [];
  }
}

export async function getLearningPathDetails(pathId: string) {
  try {
    const path = await db.query.learningPaths.findFirst({
      where: eq(learningPaths.id, pathId),
    });

    if (!path) return null;

    // Fetch the attached courses mapped with Tutor details
    const mapping = await db
      .select({
        // Join properties
        courseId: courses.id,
        position: learningPathCourses.position,
        mappingId: learningPathCourses.id,
        // Course properties
        title: courses.title,
        isPublished: courses.isPublished,
        imageUrl: courses.imageUrl,
        price: courses.price,
        // Tutor details
        tutorFirstName: users.firstName,
        tutorLastName: users.lastName,
      })
      .from(learningPathCourses)
      .innerJoin(courses, eq(learningPathCourses.courseId, courses.id))
      .leftJoin(users, eq(courses.tutorId, users.id))
      .where(eq(learningPathCourses.learningPathId, pathId))
      .orderBy(learningPathCourses.position);

    const attachedCourses = mapping;
    const totalPrice = attachedCourses.reduce(
      (acc, course) => acc + (course.price || 0),
      0,
    );

    return { ...path, attachedCourses, totalPrice };
  } catch (error) {
    console.error("[GET_LEARNING_PATH_DETAILS]", error);
    throw error;
  }
}

export async function searchCoursesForPath(query: string = "") {
  try {
    const { sessionClaims } = await auth();
    if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
      throw new Error("Unauthorized");
    }

    // Only return Active published items that can be bundled
    const availableCourses = await db
      .select({
        id: courses.id,
        title: courses.title,
        imageUrl: courses.imageUrl,
        isPublished: courses.isPublished,
        tutor: {
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(courses)
      .leftJoin(users, eq(courses.tutorId, users.id))
      .where(
        and(
          eq(courses.isPublished, true),
          query ? ilike(courses.title, `%${query}%`) : undefined,
        ),
      )
      .limit(20);

    return availableCourses;
  } catch (error) {
    console.error("[SEARCH_COURSES]", error);
    return [];
  }
}

export async function addCourseToPath(pathId: string, courseId: string) {
  try {
    const { sessionClaims } = await auth();
    if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    // Find highest position
    const existingMap = await db.query.learningPathCourses.findMany({
      where: eq(learningPathCourses.learningPathId, pathId),
    });

    // Check if already in the bundle
    const isDuplicate = existingMap.some((m) => m.courseId === courseId);
    if (isDuplicate) {
      return { success: false, error: "Course is already in bundle." };
    }

    const nextPosition =
      existingMap.length > 0
        ? Math.max(...existingMap.map((m) => m.position)) + 1
        : 1;

    await db.insert(learningPathCourses).values({
      learningPathId: pathId,
      courseId,
      position: nextPosition,
    });

    return { success: true };
  } catch (error) {
    console.error("[ADD_COURSE_TO_PATH]", error);
    return { success: false, error: "Failed to add course" };
  }
}

export async function removeCourseFromPath(mappingId: string) {
  try {
    const { sessionClaims } = await auth();
    if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    await db
      .delete(learningPathCourses)
      .where(eq(learningPathCourses.id, mappingId));
    return { success: true };
  } catch (error) {
    console.error("[REMOVE_COURSE_FROM_PATH]", error);
    return { success: false, error: "Failed to remove course" };
  }
}

export async function getPublishedLearningPaths() {
  try {
    const paths = await db.query.learningPaths.findMany({
      where: eq(learningPaths.isPublished, true),
      orderBy: [desc(learningPaths.createdAt)],
    });

    // For the marketplace, we might want to also fetch the course count
    const pathsWithCounts = await Promise.all(
      paths.map(async (path) => {
        const countRes = await db
          .select({
            id: learningPathCourses.id,
          })
          .from(learningPathCourses)
          .where(eq(learningPathCourses.learningPathId, path.id));

        return {
          ...path,
          courseCount: countRes.length,
        };
      }),
    );

    return pathsWithCounts;
  } catch (error) {
    console.error("[GET_PUBLISHED_PATHS]", error);
    return [];
  }
}

export async function enrollInLearningPath(pathId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const userRecord = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!userRecord) throw new Error("User not found");

    // Check existing enrollment
    const existing = await db.query.userLearningPaths.findFirst({
      where: and(
        eq(userLearningPaths.userId, userRecord.id),
        eq(userLearningPaths.learningPathId, pathId),
      ),
    });

    if (existing) {
      return { success: false, error: "Already enrolled in this path." };
    }

    await db.insert(userLearningPaths).values({
      userId: userRecord.id,
      learningPathId: pathId,
    });

    return { success: true };
  } catch (error) {
    console.error("[ENROLL_PATH]", error);
    return { success: false, error: "Failed to enroll" };
  }
}

export async function publishLearningPath(pathId: string) {
  try {
    const { sessionClaims } = await auth();
    if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const path = await db.query.learningPaths.findFirst({
      where: eq(learningPaths.id, pathId),
    });

    if (!path) return { success: false, error: "Path not found" };

    // Prevent publishing empty paths
    const courses = await db.query.learningPathCourses.findMany({
      where: eq(learningPathCourses.learningPathId, pathId),
    });

    if (courses.length === 0) {
      return {
        success: false,
        error:
          "Cannot publish an empty learning path. Add at least one course.",
      };
    }

    await db
      .update(learningPaths)
      .set({ isPublished: true })
      .where(eq(learningPaths.id, pathId));

    revalidatePath(`/org/paths/${pathId}`);
    revalidatePath("/org/paths");
    revalidatePath("/learner/marketplace");

    return { success: true };
  } catch (error) {
    console.error("[PUBLISH_LEARNING_PATH]", error);
    return { success: false, error: "Failed to publish learning path" };
  }
}

export async function unpublishLearningPath(pathId: string) {
  try {
    const { sessionClaims } = await auth();
    if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    await db
      .update(learningPaths)
      .set({ isPublished: false })
      .where(eq(learningPaths.id, pathId));

    revalidatePath(`/org/paths/${pathId}`);
    revalidatePath("/org/paths");
    revalidatePath("/learner/marketplace");

    return { success: true };
  } catch (error) {
    console.error("[UNPUBLISH_LEARNING_PATH]", error);
    return { success: false, error: "Failed to unpublish learning path" };
  }
}

export async function getPathLessons(pathId: string) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });

    if (!user) throw new Error("User not found");

    // Check enrollment
    const enrollment = await db.query.userLearningPaths.findFirst({
      where: and(
        eq(userLearningPaths.userId, user.id),
        eq(userLearningPaths.learningPathId, pathId),
      ),
    });

    if (!enrollment) return null;

    const path = await db.query.learningPaths.findFirst({
      where: eq(learningPaths.id, pathId),
    });

    if (!path) return null;

    // Fetch all courses in path
    const trackCourses = await db
      .select({
        id: courses.id,
        title: courses.title,
      })
      .from(learningPathCourses)
      .innerJoin(courses, eq(learningPathCourses.courseId, courses.id))
      .where(eq(learningPathCourses.learningPathId, pathId))
      .orderBy(learningPathCourses.position);

    // For each course, fetch chapters and lessons
    const fullTrack = await Promise.all(
      trackCourses.map(async (course) => {
        const courseChapters = await db.query.chapters.findMany({
          where: eq(chapters.courseId, course.id),
          orderBy: [chapters.position],
          with: {
            lessons: {
              orderBy: [lessons.position],
            },
          },
        });

        return {
          ...course,
          chapters: courseChapters,
        };
      }),
    );

    return {
      path,
      courses: fullTrack,
    };
  } catch (error) {
    console.error("[GET_PATH_LESSONS]", error);
    return null;
  }
}
