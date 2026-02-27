"use server";

import { db } from "@/lib/db";
import {
  userProgress,
  lessons,
  chapters,
  courses,
  purchases,
  users,
} from "@/drizzle/schema";
import { eq, and, count, desc, inArray, asc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { CourseProgressResult, CourseCompletionSummary } from "./types";

// Helper to grab the DB user ID
const getDbUserId = async (clerkId: string) => {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
    columns: { id: true },
  });
  return user?.id || null;
};

export async function getUserProgress(
  courseId: string,
): Promise<CourseProgressResult | { error: string }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Unauthorized" };

  const userId = await getDbUserId(clerkId);
  if (!userId) return { error: "User not found" };

  const [totalResult] = await db
    .select({ count: count() })
    .from(lessons)
    .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
    .where(eq(chapters.courseId, courseId));

  const totalLessons = totalResult?.count ?? 0;
  if (totalLessons === 0)
    return { completedLessons: 0, totalLessons: 0, percentage: 0 };

  const [completedResult] = await db
    .select({ count: count() })
    .from(userProgress)
    .innerJoin(lessons, eq(userProgress.lessonId, lessons.id))
    .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
    .where(
      and(
        eq(userProgress.userId, userId),
        eq(userProgress.isCompleted, true),
        eq(chapters.courseId, courseId),
      ),
    );

  const completedLessons = completedResult?.count ?? 0;
  return {
    completedLessons,
    totalLessons,
    percentage: Math.round((completedLessons / totalLessons) * 100),
  };
}

export async function getLastAccessedLesson(courseId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const userId = await getDbUserId(clerkId);
  if (!userId) return null;

  const [result] = await db
    .select({
      lessonId: userProgress.lessonId,
      lastAccessedAt: userProgress.lastAccessedAt,
      isCompleted: userProgress.isCompleted,
    })
    .from(userProgress)
    .innerJoin(lessons, eq(userProgress.lessonId, lessons.id))
    .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
    .where(
      and(eq(userProgress.userId, userId), eq(chapters.courseId, courseId)),
    )
    .orderBy(desc(userProgress.lastAccessedAt))
    .limit(1);

  return result || null;
}

export async function getCourseCompletion(): Promise<
  CourseCompletionSummary[] | { error: string }
> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Unauthorized" };

  const userId = await getDbUserId(clerkId);
  if (!userId) return { error: "User not found" };

  const enrolledCourses = await db
    .select({ courseId: courses.id, courseTitle: courses.title })
    .from(purchases)
    .innerJoin(courses, eq(purchases.courseId, courses.id))
    .where(eq(purchases.userId, userId));

  if (enrolledCourses.length === 0) return [];
  const courseIds = enrolledCourses.map((c) => c.courseId);

  const totalLessonsRaw = await db
    .select({ courseId: chapters.courseId, count: count(lessons.id) })
    .from(lessons)
    .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
    .where(inArray(chapters.courseId, courseIds))
    .groupBy(chapters.courseId);

  const completedLessonsRaw = await db
    .select({ courseId: chapters.courseId, count: count(userProgress.id) })
    .from(userProgress)
    .innerJoin(lessons, eq(userProgress.lessonId, lessons.id))
    .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
    .where(
      and(
        eq(userProgress.userId, userId),
        eq(userProgress.isCompleted, true),
        inArray(chapters.courseId, courseIds),
      ),
    )
    .groupBy(chapters.courseId);

  const totalLessonsMap = new Map(
    totalLessonsRaw.map((r) => [r.courseId, r.count]),
  );
  const completedLessonsMap = new Map(
    completedLessonsRaw.map((r) => [r.courseId, r.count]),
  );

  return enrolledCourses.map((course) => {
    const totalLessons = totalLessonsMap.get(course.courseId) ?? 0;
    const completedLessons = completedLessonsMap.get(course.courseId) ?? 0;
    return {
      courseId: course.courseId,
      courseTitle: course.courseTitle,
      completedLessons,
      totalLessons,
      percentage:
        totalLessons === 0
          ? 0
          : Math.round((completedLessons / totalLessons) * 100),
    };
  });
}

/**
 * Internal helper: given a lessonId + userId, resolves the course and checks
 * whether every lesson in that course is completed.
 * NOT a server action — called from other server actions.
 */
export async function checkCourseCompletionByLesson(
  userId: string,
  lessonId: string,
): Promise<{
  courseCompleted: boolean;
  courseId: string;
  courseTitle: string;
}> {
  // Resolve lesson → chapter → course
  const lessonRow = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    columns: { chapterId: true },
    with: {
      chapter: {
        columns: { courseId: true },
        with: {
          course: { columns: { id: true, title: true } },
        },
      },
    },
  });

  const course = lessonRow?.chapter?.course;
  if (!course) return { courseCompleted: false, courseId: "", courseTitle: "" };

  const [totalResult] = await db
    .select({ count: count() })
    .from(lessons)
    .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
    .where(eq(chapters.courseId, course.id));

  const totalLessons = totalResult?.count ?? 0;
  if (totalLessons === 0)
    return { courseCompleted: false, courseId: course.id, courseTitle: course.title };

  const [completedResult] = await db
    .select({ count: count() })
    .from(userProgress)
    .innerJoin(lessons, eq(userProgress.lessonId, lessons.id))
    .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
    .where(
      and(
        eq(userProgress.userId, userId),
        eq(userProgress.isCompleted, true),
        eq(chapters.courseId, course.id),
      ),
    );

  const completedLessons = completedResult?.count ?? 0;

  return {
    courseCompleted: completedLessons >= totalLessons,
    courseId: course.id,
    courseTitle: course.title,
  };
}

export async function checkLessonCompletion(lessonId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return false;

  const userId = await getDbUserId(clerkId);
  if (!userId) return false;

  const progress = await db.query.userProgress.findFirst({
    where: and(
      eq(userProgress.userId, userId),
      eq(userProgress.lessonId, lessonId),
    ),
  });

  return progress?.isCompleted ?? false;
}

export async function getCourseProgressDetails(courseId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Unauthorized" };

  const userId = await getDbUserId(clerkId);
  if (!userId) return { error: "User not found" };

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    with: {
      chapters: {
        orderBy: [asc(chapters.position)],
        with: {
          lessons: {
            orderBy: [asc(lessons.position)],
            with: {
              // Inject user's progress directly into the lesson object
              userProgress: {
                where: eq(userProgress.userId, userId),
                limit: 1,
              },
            },
          },
        },
      },
    },
  });

  if (!course) return { error: "Course not found" };

  // Flatten the injected array into simple properties for the frontend
  const chaptersWithProgress = course.chapters.map((chapter) => ({
    ...chapter,
    lessons: chapter.lessons.map((lesson) => {
      const progressRecord = lesson.userProgress?.[0];
      return {
        ...lesson,
        isCompleted: progressRecord?.isCompleted ?? false,
        lastAccessedAt: progressRecord?.lastAccessedAt ?? null,
      };
    }),
  }));

  return { course: { ...course, chapters: chaptersWithProgress } };
}
