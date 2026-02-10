"use server";

import { db } from "@/lib/db";
import { users, courses, purchases } from "@/drizzle/schema";
import { eq, count, desc, and } from "drizzle-orm";

export async function getTutorProfile(tutorId: string) {
  try {
    const tutor = await db.query.users.findFirst({
      where: eq(users.id, tutorId),
    });

    if (!tutor) {
      return null;
    }

    // Get tutor's published courses
    const tutorCourses = await db.query.courses.findMany({
      where: and(eq(courses.tutorId, tutorId), eq(courses.isPublished, true)),
      orderBy: [desc(courses.createdAt)],
      with: {
        tutor: true,
        chapters: {
          columns: {
            id: true,
          },
          with: {
            lessons: {
              columns: {
                id: true,
              },
            },
          },
        },
      },
    });

    // Get Total Students (Count unique purchases of their courses)
    // This is a bit complex in pure Drizzle without raw SQL for aggregations across joins sometimes,
    // but we can approximate or do a join count.
    // Efficient way: Join purchases -> courses -> where courses.tutorId = tutorId
    const [studentCountResult] = await db
      .select({ count: count() })
      .from(purchases)
      .innerJoin(courses, eq(purchases.courseId, courses.id))
      .where(eq(courses.tutorId, tutorId));

    const totalStudents = studentCountResult?.count ?? 0;

    // 4. Mock Reviews (for now)
    // Formula: (Students * 0.15) + Random offset
    const totalReviews = Math.floor(totalStudents * 0.15) + 12;

    return {
      ...tutor,
      totalStudents,
      totalReviews,
      courses: tutorCourses,
    };
  } catch (error) {
    console.error("[GET_TUTOR_PROFILE]", error);
    return null;
  }
}
