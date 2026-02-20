"use server";

import { db } from "@/lib/db";
import { users, courses, purchases } from "@/drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { getTutorRatingStats } from "@/actions/reviews";

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

    const [studentCountResult] = await db
      .select({ count: sql<number>`count(distinct ${purchases.userId})` })
      .from(purchases)
      .innerJoin(courses, eq(purchases.courseId, courses.id))
      .where(eq(courses.tutorId, tutorId));

    const totalStudents = Number(studentCountResult?.count || 0);

    const ratingStats = await getTutorRatingStats(tutorId);

    return {
      ...tutor,
      totalStudents,
      totalReviews: ratingStats.totalReviews,
      avgRating: ratingStats.avgRating,
      courses: tutorCourses,
    };
  } catch (error) {
    console.error("[GET_TUTOR_PROFILE]", error);
    return null;
  }
}
