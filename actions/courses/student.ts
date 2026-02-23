"use server";

import { db } from "@/lib/db";
import {
  courses,
  users,
  purchases,
  chapters,
  lessons,
  userProgress,
  learningPathCourses,
  userLearningPaths,
} from "@/drizzle/schema";
import { eq, and, desc, count, inArray } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function getEnrolledCourses() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const student = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  if (!student) throw new Error("User not found");

  const enrolledCourses = await db
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
    .innerJoin(purchases, eq(courses.id, purchases.courseId))
    .leftJoin(users, eq(courses.tutorId, users.id))
    .where(eq(purchases.userId, student.id))
    .orderBy(desc(purchases.createdAt));

  if (enrolledCourses.length === 0) return [];

  const courseIds = enrolledCourses.map((c) => c.id);

  const totalLessonsData = await db
    .select({ courseId: chapters.courseId, total: count(lessons.id) })
    .from(lessons)
    .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
    .where(inArray(chapters.courseId, courseIds))
    .groupBy(chapters.courseId);
  const totalLessonsMap = new Map(
    totalLessonsData.map((t) => [t.courseId, t.total]),
  );

  const completedLessonsData = await db
    .select({ courseId: chapters.courseId, completed: count(userProgress.id) })
    .from(userProgress)
    .innerJoin(lessons, eq(userProgress.lessonId, lessons.id))
    .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
    .where(
      and(
        eq(userProgress.userId, student.id),
        eq(userProgress.isCompleted, true),
        inArray(chapters.courseId, courseIds),
      ),
    )
    .groupBy(chapters.courseId);
  const completedLessonsMap = new Map(
    completedLessonsData.map((c) => [c.courseId, c.completed]),
  );

  return enrolledCourses.map((course) => {
    const totalLessons = totalLessonsMap.get(course.id) ?? 0;
    const completedLessons = completedLessonsMap.get(course.id) ?? 0;
    const progressPercentage =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    return { ...course, progressPercentage, completedLessons, totalLessons };
  });
}

export async function verifyCourseAccess(
  userId: string,
  courseId: string,
): Promise<boolean> {
  const purchase = await db.query.purchases.findFirst({
    where: and(eq(purchases.courseId, courseId), eq(purchases.userId, userId)),
  });
  if (purchase) return true;

  const bundleAccess = await db
    .select({ id: userLearningPaths.id })
    .from(userLearningPaths)
    .innerJoin(
      learningPathCourses,
      eq(userLearningPaths.learningPathId, learningPathCourses.learningPathId),
    )
    .where(
      and(
        eq(userLearningPaths.userId, userId),
        eq(learningPathCourses.courseId, courseId),
      ),
    )
    .limit(1);

  return bundleAccess.length > 0;
}

export async function checkEnrollment(courseId: string) {
  const { userId } = await auth();
  if (!userId) return false;

  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  if (!dbUser) return false;

  return await verifyCourseAccess(dbUser.id, courseId);
}
