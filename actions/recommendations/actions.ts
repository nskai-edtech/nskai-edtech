"use server";

import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { fetchCoursesByInterests, fetchFallbackCourses } from "./queries";
import { RecommendedCourse } from "./types";

export async function getRecommendedCourses(
  limit: number = 4,
): Promise<RecommendedCourse[]> {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return [];
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
      columns: { interests: true },
    });

    if (!user?.interests || user.interests.length === 0) {
      return await fetchFallbackCourses(limit);
    }

    const recommendations = await fetchCoursesByInterests(
      user.interests,
      limit,
    );

    if (recommendations.length === 0) {
      return await fetchFallbackCourses(limit);
    }

    return recommendations;
  } catch (error) {
    console.error("[GET_RECOMMENDED_COURSES]", error);
    return [];
  }
}
