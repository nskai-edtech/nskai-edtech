"use server";

import { db } from "@/lib/db";
import { users, courses, purchases } from "@/drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { getTutorRatingStats } from "./reviews/queries";

export async function getTutorProfile(tutorId: string) {
  try {
    const tutor = await db.query.users.findFirst({
      where: eq(users.id, tutorId),
    });

    if (!tutor) {
      return null;
    }

    const [tutorCourses, [studentCountResult], ratingStats] = await Promise.all(
      [
        db.query.courses.findMany({
          where: and(
            eq(courses.tutorId, tutorId),
            eq(courses.status, "PUBLISHED"),
          ),
          orderBy: [desc(courses.createdAt)],
          with: {
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
        }),
        db
          .select({ count: sql<number>`count(distinct ${purchases.userId})` })
          .from(purchases)
          .innerJoin(courses, eq(purchases.courseId, courses.id))
          .where(eq(courses.tutorId, tutorId)),
        getTutorRatingStats(tutorId),
      ],
    );

    const totalStudents = Number(studentCountResult?.count || 0);

    const coursesWithTutor = tutorCourses.map((course) => ({
      ...course,
      tutor,
    }));

    return {
      ...tutor,
      totalStudents,
      totalReviews: ratingStats.totalReviews,
      avgRating: ratingStats.avgRating,
      courses: coursesWithTutor,
    };
  } catch (error) {
    console.error("[GET_TUTOR_PROFILE]", error);
    return null;
  }
}
