"use server";

import { db } from "@/lib/db";
import { courses, userProgress, users, purchases } from "@/drizzle/schema";
import { eq, and, count, desc, inArray } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

interface CompletedCourse {
  courseId: string;
  courseTitle: string;
  courseImageUrl: string | null;
  tutorName: string;
  completionDate: Date;
  totalLessons: number;
}

interface CertificateData {
  courseTitle: string;
  courseImageUrl: string | null;
  learnerName: string;
  tutorName: string;
  completionDate: Date;
  courseId: string;
}

/**
 * Get all courses that the learner has completed (100% progress)
 */
export async function getCompletedCourses(): Promise<
  { error: string } | { courses: CompletedCourse[] }
> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return { error: "User not found" };
    }

    // 1. Get purchased course IDs
    const purchasedCourses = await db
      .select({
        courseId: purchases.courseId,
      })
      .from(purchases)
      .where(eq(purchases.userId, user.id));

    const purchasedCourseIds = purchasedCourses
      .map((p) => p.courseId)
      .filter((id): id is string => !!id);

    if (purchasedCourseIds.length === 0) {
      return { courses: [] };
    }

    // 2. Get details only for purchased courses
    const allCourses = await db.query.courses.findMany({
      where: inArray(courses.id, purchasedCourseIds),
      with: {
        chapters: {
          with: {
            lessons: true,
          },
        },
        tutor: true,
      },
    });

    const completedCourses: CompletedCourse[] = [];

    for (const course of allCourses) {
      const { lessonIds, completedCount, completionDate } =
        await getCourseCompletionStatus(user.id, course);

      // Check if all lessons are completed
      if (
        completedCount === lessonIds.length &&
        lessonIds.length > 0 &&
        completionDate
      ) {
        completedCourses.push({
          courseId: course.id,
          courseTitle: course.title,
          courseImageUrl: course.imageUrl,
          tutorName: course.tutor
            ? `${course.tutor.firstName || ""} ${course.tutor.lastName || ""}`.trim() ||
              "NSK.AI Instructor"
            : "NSK.AI Instructor",
          completionDate,
          totalLessons: lessonIds.length,
        });
      }
    }

    // Sort by completion date (most recent first)
    completedCourses.sort(
      (a, b) => b.completionDate.getTime() - a.completionDate.getTime(),
    );

    return { courses: completedCourses };
  } catch (error) {
    console.error("[GET_COMPLETED_COURSES]", error);
    return { error: "Failed to get completed courses" };
  }
}

/**
 * Get certificate data for a specific course
 */
export async function getCertificateData(
  courseId: string,
): Promise<{ error: string } | CertificateData> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return { error: "User not found" };
    }

    // Defensive check: Verify enrollment
    const purchase = await db.query.purchases.findFirst({
      where: and(
        eq(purchases.userId, user.id),
        eq(purchases.courseId, courseId),
      ),
    });

    if (!purchase || purchase.status !== "success") {
      return { error: "User not enrolled in this course" };
    }

    // Get course details
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      with: {
        tutor: true,
        chapters: {
          with: {
            lessons: true,
          },
        },
      },
    });

    if (!course) {
      return { error: "Course not found" };
    }

    const { lessonIds, completedCount, completionDate } =
      await getCourseCompletionStatus(user.id, course);

    if (lessonIds.length === 0) {
      return { error: "Course has no lessons" };
    }

    if (completedCount !== lessonIds.length) {
      return { error: "Course not completed yet" };
    }

    const learnerName =
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Learner";

    const tutorName = course.tutor
      ? `${course.tutor.firstName || ""} ${course.tutor.lastName || ""}`.trim() ||
        "NSK.AI Instructor"
      : "NSK.AI Instructor";

    return {
      courseTitle: course.title,
      courseImageUrl: course.imageUrl,
      learnerName,
      tutorName,
      completionDate: completionDate ?? new Date(),
      courseId: course.id,
    };
  } catch (error) {
    console.error("[GET_CERTIFICATE_DATA]", error);
    return { error: "Failed to get certificate data" };
  }
}

/**
 * Check if learner is eligible for a certificate (100% completion)
 */
export async function checkCertificateEligibility(
  courseId: string,
): Promise<{ eligible: boolean; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { eligible: false, error: "Unauthorized" };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return { eligible: false, error: "User not found" };
    }

    // Defensive check: Verify enrollment
    const purchase = await db.query.purchases.findFirst({
      where: and(
        eq(purchases.userId, user.id),
        eq(purchases.courseId, courseId),
      ),
    });

    if (!purchase || purchase.status !== "success") {
      return { eligible: false, error: "User not enrolled" };
    }

    // Get course with lessons
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      with: {
        chapters: {
          with: {
            lessons: true,
          },
        },
      },
    });

    if (!course) {
      return { eligible: false, error: "Course not found" };
    }

    const { lessonIds, completedCount } = await getCourseCompletionStatus(
      user.id,
      course,
    );

    if (lessonIds.length === 0) {
      return { eligible: false, error: "Course has no lessons" };
    }

    return { eligible: completedCount === lessonIds.length };
  } catch (error) {
    console.error("[CHECK_CERTIFICATE_ELIGIBILITY]", error);
    return { eligible: false, error: "Failed to check eligibility" };
  }
}

/**
 * Helper: Get completion status for a specific course
 */
async function getCourseCompletionStatus(
  userId: string,
  course: {
    chapters: {
      lessons: { id: string }[];
    }[];
  },
) {
  const lessonIds = course.chapters.flatMap((chapter) =>
    chapter.lessons.map((lesson) => lesson.id),
  );

  if (lessonIds.length === 0) {
    return { lessonIds, completedCount: 0, completionDate: null };
  }

  // Get completed lessons count
  const completedLessonsResult = await db
    .select({ count: count() })
    .from(userProgress)
    .where(
      and(
        eq(userProgress.userId, userId),
        eq(userProgress.isCompleted, true),
        inArray(userProgress.lessonId, lessonIds),
      ),
    );

  const completedCount = completedLessonsResult[0]?.count ?? 0;
  let completionDate: Date | null = null;

  // If completed, get the latest completion date
  if (completedCount === lessonIds.length) {
    const lastProgressResult = await db
      .select({ lastAccessedAt: userProgress.lastAccessedAt })
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.isCompleted, true),
          inArray(userProgress.lessonId, lessonIds),
        ),
      )
      .orderBy(desc(userProgress.lastAccessedAt))
      .limit(1);

    completionDate = lastProgressResult[0]?.lastAccessedAt ?? new Date();
  }

  return { lessonIds, completedCount, completionDate };
}
