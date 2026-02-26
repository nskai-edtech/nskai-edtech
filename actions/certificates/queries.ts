"use server";

import { db } from "@/lib/db";
import {
  courses,
  userProgress,
  users,
  purchases,
  chapters,
  lessons,
  certificates,
} from "@/drizzle/schema";
import { eq, and, sql, aliasedTable } from "drizzle-orm";

// --- QUERIES ---

export interface VerificationRecord {
  id: string;
  createdAt: Date;
  learnerFirstName: string;
  learnerLastName: string;
  courseTitle: string;
  courseImageUrl: string | null;
  tutorFirstName: string | null;
  tutorLastName: string | null;
}

export async function verifyCertificate(
  certificateId: string,
): Promise<VerificationRecord | null> {
  try {
    const tutors = aliasedTable(users, "tutor");
    const learners = aliasedTable(users, "learner");

    const record = (await db
      .select({
        id: certificates.id,
        createdAt: certificates.createdAt,
        learnerFirstName: learners.firstName,
        learnerLastName: learners.lastName,
        courseTitle: courses.title,
        courseImageUrl: courses.imageUrl,
        tutorFirstName: tutors.firstName,
        tutorLastName: tutors.lastName,
      })
      .from(certificates)
      .innerJoin(learners, eq(certificates.userId, learners.clerkId))
      .innerJoin(courses, eq(certificates.courseId, courses.id))
      .leftJoin(tutors, eq(courses.tutorId, tutors.id))
      .where(eq(certificates.id, certificateId))
      .limit(1)) as VerificationRecord[];

    if (record.length === 0) return null;

    return record[0];
  } catch (error) {
    console.error("[VERIFY_CERTIFICATE_ERROR]", error);
    return null;
  }
}

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
