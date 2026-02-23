/* eslint-disable @typescript-eslint/ban-ts-comment */
"use server";

import { db } from "@/lib/db";
import {
  learningPaths,
  learningPathCourses,
  courses,
  users,
  userLearningPaths,
} from "@/drizzle/schema";
import { eq, and, sql, ilike } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { fetchPublishedPathsWithCounts, fetchFullTrackData } from "./queries";

// --- ADMIN ACTIONS ---

export async function createLearningPath(title: string, description: string) {
  const { sessionClaims } = await auth();
  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN")
    return { error: "Unauthorized" };

  try {
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
    return { error: "Failed to create learning path" };
  }
}

export async function getLearningPathDetails(pathId: string) {
  const path = await db.query.learningPaths.findFirst({
    where: eq(learningPaths.id, pathId),
  });
  if (!path) return null;

  const attachedCourses = await db
    .select({
      courseId: courses.id,
      position: learningPathCourses.position,
      mappingId: learningPathCourses.id,
      title: courses.title,
      status: courses.status,
      imageUrl: courses.imageUrl,
      price: courses.price,
      tutorFirstName: users.firstName,
      tutorLastName: users.lastName,
    })
    .from(learningPathCourses)
    .innerJoin(courses, eq(learningPathCourses.courseId, courses.id))
    .leftJoin(users, eq(courses.tutorId, users.id))
    .where(eq(learningPathCourses.learningPathId, pathId))
    .orderBy(learningPathCourses.position);

  const totalPrice = attachedCourses.reduce(
    (acc, c) => acc + (c.price || 0),
    0,
  );
  return { ...path, attachedCourses, totalPrice };
}

export async function addCourseToPath(pathId: string, courseId: string) {
  const { sessionClaims } = await auth();
  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN")
    return { error: "Unauthorized" };

  // Use uniqueIndex in schema to prevent duplicates
  const existing = await db.query.learningPathCourses.findFirst({
    where: and(
      eq(learningPathCourses.learningPathId, pathId),
      eq(learningPathCourses.courseId, courseId),
    ),
  });
  if (existing) return { error: "Course already in bundle" };

  const [maxPos] = await db
    .select({ max: sql<number>`max(${learningPathCourses.position})` })
    .from(learningPathCourses)
    .where(eq(learningPathCourses.learningPathId, pathId));

  await db.insert(learningPathCourses).values({
    learningPathId: pathId,
    courseId,
    position: (maxPos?.max || 0) + 1,
  });

  revalidatePath(`/org/paths/${pathId}`);
  return { success: true };
}

export async function getAdminLearningPaths() {
  return await db.query.learningPaths.findMany({
    orderBy: (learningPaths, { desc }) => [desc(learningPaths.createdAt)],
  });
}

export async function searchCoursesForPath(query: string = "") {
  try {
    const { sessionClaims } = await auth();

    // @ts-ignore -
    if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
      throw new Error("Unauthorized");
    }

    const availableCourses = await db
      .select({
        id: courses.id,
        title: courses.title,
        imageUrl: courses.imageUrl,
        status: courses.status,
        tutorFirstName: users.firstName,
        tutorLastName: users.lastName,
      })
      .from(courses)
      .leftJoin(users, eq(courses.tutorId, users.id))
      .where(
        and(
          eq(courses.status, "PUBLISHED"), // Only bundle approved content
          query ? ilike(courses.title, `%${query}%`) : undefined,
        ),
      )
      .limit(20);

    return availableCourses;
  } catch (error) {
    console.error("[SEARCH_COURSES_FOR_PATH]", error);
    return [];
  }
}

export async function unpublishLearningPath(pathId: string) {
  try {
    const { sessionClaims } = await auth();

    // @ts-ignore
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

export async function removeCourseFromPath(mappingId: string) {
  try {
    const { sessionClaims } = await auth();

    // @ts-ignore -
    if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const mapping = await db.query.learningPathCourses.findFirst({
      where: eq(learningPathCourses.id, mappingId),
    });

    if (!mapping) {
      return { success: false, error: "Mapping not found" };
    }

    await db
      .delete(learningPathCourses)
      .where(eq(learningPathCourses.id, mappingId));

    revalidatePath(`/org/paths/${mapping.learningPathId}`);
    revalidatePath("/learner/marketplace");

    return { success: true };
  } catch (error) {
    console.error("[REMOVE_COURSE_FROM_PATH]", error);
    return { success: false, error: "Failed to remove course from path" };
  }
}

// --- LEARNER ACTIONS ---

export async function getPublishedLearningPaths() {
  return await fetchPublishedPathsWithCounts();
}

export async function getPathLessons(pathId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });
  if (!user) return null;

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
  const trackData = await fetchFullTrackData(pathId);

  return {
    path,
    courses: trackData.map((m) => ({
      ...m.course,
      chapters: m.course?.chapters || [],
    })),
  };
}

export async function publishLearningPath(pathId: string) {
  const { sessionClaims } = await auth();
  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN")
    return { error: "Unauthorized" };

  const coursesCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(learningPathCourses)
    .where(eq(learningPathCourses.learningPathId, pathId));

  if (Number(coursesCount[0].count) === 0) {
    return { error: "Add at least one course before publishing." };
  }

  await db
    .update(learningPaths)
    .set({ isPublished: true })
    .where(eq(learningPaths.id, pathId));
  revalidatePath("/org/paths");
  return { success: true };
}

export async function enrollInLearningPath(pathId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Unauthorized" };

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });
  if (!user) return { error: "User not found" };

  const path = await db.query.learningPaths.findFirst({
    where: eq(learningPaths.id, pathId),
  });
  if (!path) return { error: "Path not found" };

  const existingEnrollment = await db.query.userLearningPaths.findFirst({
    where: and(
      eq(userLearningPaths.userId, user.id),
      eq(userLearningPaths.learningPathId, pathId),
    ),
  });
  if (existingEnrollment) return { error: "Already enrolled" };

  await db.insert(userLearningPaths).values({
    userId: user.id,
    learningPathId: pathId,
  });

  revalidatePath(`/learner/paths/${pathId}`);
  revalidatePath(`/learner/paths`);
  return { success: true };
}
