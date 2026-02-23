"use server";

import { db } from "@/lib/db";
import {
  courses,
  userProgress,
  users,
  purchases,
  chapters,
  lessons,
} from "@/drizzle/schema";
import { eq, and, sql, aliasedTable } from "drizzle-orm";

// --- QUERIES ---

export async function fetchUserCourseProgress(
  userId: string,
  specificCourseId?: string,
) {
  const tutors = aliasedTable(users, "tutor");

  // Base conditions: must be this user and must be a successful purchase
  const conditions = [
    eq(purchases.userId, userId),
    eq(purchases.status, "success"),
  ];

  if (specificCourseId) {
    conditions.push(eq(purchases.courseId, specificCourseId));
  }

  const rawProgress = await db
    .select({
      courseId: courses.id,
      courseTitle: courses.title,
      courseImageUrl: courses.imageUrl,
      tutorFirstName: tutors.firstName,
      tutorLastName: tutors.lastName,
      totalLessons: sql<number>`cast(count(distinct ${lessons.id}) as integer)`,
      completedLessons: sql<number>`cast(count(distinct ${userProgress.id}) as integer)`,
      completionDate: sql<Date>`max(${userProgress.lastAccessedAt})`,
    })
    .from(purchases)
    .innerJoin(courses, eq(purchases.courseId, courses.id))
    .leftJoin(tutors, eq(courses.tutorId, tutors.id))
    .leftJoin(chapters, eq(chapters.courseId, courses.id))
    .leftJoin(lessons, eq(lessons.chapterId, chapters.id))
    .leftJoin(
      userProgress,
      and(
        eq(userProgress.lessonId, lessons.id),
        eq(userProgress.userId, userId),
        eq(userProgress.isCompleted, true),
      ),
    )
    .where(and(...conditions))
    .groupBy(courses.id, tutors.id);

  // Filter only courses that have lessons AND are 100% completed
  return rawProgress
    .filter(
      (course) =>
        course.totalLessons > 0 &&
        course.totalLessons === course.completedLessons,
    )
    .sort(
      (a, b) =>
        new Date(b.completionDate).getTime() -
        new Date(a.completionDate).getTime(),
    );
}
