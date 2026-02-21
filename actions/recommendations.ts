"use server";

import { db } from "@/lib/db";
import { courses, users } from "@/drizzle/schema";
import { eq, and, or, ilike, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { CourseWithTutor } from "./courses";

/**
 * Dynamically fetches recommended courses based on the user's saved interests.
 * Uses `ilike` to match keywords against course titles and descriptions.
 */
export async function getRecommendedCourses(
  limit: number = 4,
): Promise<CourseWithTutor[]> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return [];
    }

    // 1. Fetch user to get their interests
    const userRecord = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (
      !userRecord ||
      !userRecord.interests ||
      userRecord.interests.length === 0
    ) {
      // If no interests, fallback to returning the newest published courses
      return fetchFallbackCourses(limit);
    }

    const { interests } = userRecord;

    // 2. Build the dynamic ILIKE conditions
    // We want courses where title matches ANY interest OR description matches ANY interest
    const interestConditions = interests.flatMap((interest) => [
      ilike(courses.title, `%${interest}%`),
      ilike(courses.description, `%${interest}%`),
    ]);

    // 3. Query the database
    const recommendations = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        price: courses.price,
        isPublished: courses.isPublished,
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
      .leftJoin(users, eq(courses.tutorId, users.id))
      .where(and(eq(courses.isPublished, true), or(...interestConditions)))
      .orderBy(desc(courses.createdAt))
      .limit(limit);

    // 4. If the recommendations are empty (no matches), return fallback
    if (recommendations.length === 0) {
      return fetchFallbackCourses(limit);
    }

    return recommendations as CourseWithTutor[];
  } catch (error) {
    console.error("[GET_RECOMMENDED_COURSES]", error);
    return [];
  }
}

/**
 * Fallback query if the user has no interests or no matches were found.
 * Returns the most recently published courses.
 */
async function fetchFallbackCourses(limit: number): Promise<CourseWithTutor[]> {
  const fallback = await db
    .select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
      price: courses.price,
      isPublished: courses.isPublished,
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
    .leftJoin(users, eq(courses.tutorId, users.id))
    .where(eq(courses.isPublished, true))
    .orderBy(desc(courses.createdAt))
    .limit(limit);

  return fallback as CourseWithTutor[];
}
