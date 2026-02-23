"use server";

import { db } from "@/lib/db";
import { courses, users } from "@/drizzle/schema";
import { eq, and, or, ilike, desc } from "drizzle-orm";
import { RecommendedCourse } from "./types";

// Reusable select shape keeps queries DRY and synced
const courseSelectShape = {
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
};

export async function fetchFallbackCourses(
  limit: number,
): Promise<RecommendedCourse[]> {
  return (await db
    .select(courseSelectShape)
    .from(courses)
    .leftJoin(users, eq(courses.tutorId, users.id))
    .where(eq(courses.status, "PUBLISHED"))
    .orderBy(desc(courses.createdAt))
    .limit(limit)) as RecommendedCourse[];
}

export async function fetchCoursesByInterests(
  interests: string[],
  limit: number,
): Promise<RecommendedCourse[]> {
  const interestConditions = interests.flatMap((interest) => [
    ilike(courses.title, `%${interest}%`),
    ilike(courses.description, `%${interest}%`),
  ]);

  return (await db
    .select(courseSelectShape)
    .from(courses)
    .leftJoin(users, eq(courses.tutorId, users.id))
    .where(and(eq(courses.status, "PUBLISHED"), or(...interestConditions)))
    .orderBy(desc(courses.createdAt))
    .limit(limit)) as RecommendedCourse[];
}
