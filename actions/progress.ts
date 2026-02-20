"use server";

import { db } from "@/lib/db";
import {
  userProgress,
  lessons,
  chapters,
  courses,
  users,
  purchases,
} from "@/drizzle/schema";
import { eq, and, count, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Mark a lesson as completed for the current user
 */
export async function markLessonComplete(lessonId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }

    // Get user's database ID
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return { error: "User not found" };
    }

    // Check if progress record already exists
    const existingProgress = await db.query.userProgress.findFirst({
      where: and(
        eq(userProgress.userId, user.id),
        eq(userProgress.lessonId, lessonId),
      ),
    });

    if (existingProgress) {
      // Update existing record
      await db
        .update(userProgress)
        .set({
          isCompleted: true,
          lastAccessedAt: new Date(),
        })
        .where(eq(userProgress.id, existingProgress.id));
    } else {
      // Create new progress record
      await db.insert(userProgress).values({
        userId: user.id,
        lessonId: lessonId,
        isCompleted: true,
        lastAccessedAt: new Date(),
      });
    }

    // Revalidate relevant paths
    revalidatePath("/learner/enrolled");
    revalidatePath("/learner");

    return { success: true };
  } catch (error) {
    console.error("[MARK_LESSON_COMPLETE]", error);
    return { error: "Failed to mark lesson complete" };
  }
}

/**
 * Update last accessed timestamp for a lesson (without marking complete)
 */
export async function updateLastAccessed(lessonId: string) {
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

    // Check if progress record exists
    const existingProgress = await db.query.userProgress.findFirst({
      where: and(
        eq(userProgress.userId, user.id),
        eq(userProgress.lessonId, lessonId),
      ),
    });

    if (existingProgress) {
      // Update timestamp only
      await db
        .update(userProgress)
        .set({
          lastAccessedAt: new Date(),
        })
        .where(eq(userProgress.id, existingProgress.id));
    } else {
      // Create new record with incomplete status
      await db.insert(userProgress).values({
        userId: user.id,
        lessonId: lessonId,
        isCompleted: false,
        lastAccessedAt: new Date(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error("[UPDATE_LAST_ACCESSED]", error);
    return { error: "Failed to update last accessed" };
  }
}

/**
 * Get course completion percentage for the current user
 */
export async function getUserProgress(courseId: string) {
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

    // Get total lessons in the course
    const totalLessonsResult = await db
      .select({ count: count() })
      .from(lessons)
      .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
      .where(eq(chapters.courseId, courseId));

    const totalLessons = totalLessonsResult[0]?.count ?? 0;

    if (totalLessons === 0) {
      return {
        completedLessons: 0,
        totalLessons: 0,
        percentage: 0,
      };
    }

    // Get completed lessons count
    const completedLessonsResult = await db
      .select({ count: count() })
      .from(userProgress)
      .innerJoin(lessons, eq(userProgress.lessonId, lessons.id))
      .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
      .where(
        and(
          eq(userProgress.userId, user.id),
          eq(userProgress.isCompleted, true),
          eq(chapters.courseId, courseId),
        ),
      );

    const completedLessons = completedLessonsResult[0]?.count ?? 0;
    const percentage = Math.round((completedLessons / totalLessons) * 100);

    return {
      completedLessons,
      totalLessons,
      percentage,
    };
  } catch (error) {
    console.error("[GET_USER_PROGRESS]", error);
    return { error: "Failed to get user progress" };
  }
}

/**
 * Get the last accessed lesson in a course (for "Continue Learning")
 */
export async function getLastAccessedLesson(courseId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return null;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return null;
    }

    // Find the most recently accessed lesson in this course
    const result = await db
      .select({
        lessonId: userProgress.lessonId,
        lastAccessedAt: userProgress.lastAccessedAt,
        isCompleted: userProgress.isCompleted,
      })
      .from(userProgress)
      .innerJoin(lessons, eq(userProgress.lessonId, lessons.id))
      .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
      .where(
        and(eq(userProgress.userId, user.id), eq(chapters.courseId, courseId)),
      )
      .orderBy(desc(userProgress.lastAccessedAt))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("[GET_LAST_ACCESSED_LESSON]", error);
    return null;
  }
}

/**
 * Get completion status for all enrolled courses
 */
export async function getCourseCompletion() {
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

    // Get all purchased courses
    const enrolledCourses = await db
      .select({
        courseId: courses.id,
        courseTitle: courses.title,
      })
      .from(purchases)
      .innerJoin(courses, eq(purchases.courseId, courses.id))
      .where(eq(purchases.userId, user.id));

    // For each course, calculate progress
    const coursesWithProgress = await Promise.all(
      enrolledCourses.map(async (course) => {
        const progress = await getUserProgress(course.courseId);

        if ("error" in progress) {
          return {
            courseId: course.courseId,
            courseTitle: course.courseTitle,
            completedLessons: 0,
            totalLessons: 0,
            percentage: 0,
          };
        }

        return {
          courseId: course.courseId,
          courseTitle: course.courseTitle,
          ...progress,
        };
      }),
    );

    return coursesWithProgress;
  } catch (error) {
    console.error("[GET_COURSE_COMPLETION]", error);
    return { error: "Failed to get course completion" };
  }
}

/**
 * Check if a specific lesson is completed
 */
export async function checkLessonCompletion(lessonId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return false;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return false;
    }

    const progress = await db.query.userProgress.findFirst({
      where: and(
        eq(userProgress.userId, user.id),
        eq(userProgress.lessonId, lessonId),
      ),
    });

    return progress?.isCompleted ?? false;
  } catch (error) {
    console.error("[CHECK_LESSON_COMPLETION]", error);
    return false;
  }
}

/**
 * Get progress data for a specific course with lesson-level details
 */
export async function getCourseProgressDetails(courseId: string) {
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

    // Get course with all lessons
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      with: {
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

    if (!course) {
      return { error: "Course not found" };
    }

    // Get all progress records for this user
    const progressRecords = await db.query.userProgress.findMany({
      where: and(eq(userProgress.userId, user.id)),
    });

    // map lesson progress
    const progressMap = new Map(progressRecords.map((p) => [p.lessonId, p]));

    // Attach progress to each lesson
    const chaptersWithProgress = course.chapters.map((chapter) => ({
      ...chapter,
      lessons: chapter.lessons.map((lesson) => ({
        ...lesson,
        isCompleted: progressMap.get(lesson.id)?.isCompleted ?? false,
        lastAccessedAt: progressMap.get(lesson.id)?.lastAccessedAt ?? null,
      })),
    }));

    return {
      course: {
        ...course,
        chapters: chaptersWithProgress,
      },
    };
  } catch (error) {
    console.error("[GET_COURSE_PROGRESS_DETAILS]", error);
    return { error: "Failed to get course progress details" };
  }
}
