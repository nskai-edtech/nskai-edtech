"use server";

import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { unstable_cache } from "next/cache";
import {
  fetchCoursesBySkillGap,
  fetchCoursesByInterests,
  fetchPopularCourses,
  fetchHighlyRatedCourses,
  fetchFallbackCourses,
} from "./queries";
import { RecommendedCourse } from "./types";

async function buildRecommendations(
  userId: string,
  interests: string[],
  limit: number,
): Promise<RecommendedCourse[]> {
  const results: RecommendedCourse[] = [];
  const seenIds = new Set<string>();

  const addUnique = (items: RecommendedCourse[]) => {
    for (const item of items) {
      if (!seenIds.has(item.id) && results.length < limit) {
        seenIds.add(item.id);
        results.push(item);
      }
    }
  };

  // Priority 0: Skill-gap recommendations (courses for weak skills)
  const skillGapCourses = await fetchCoursesBySkillGap(userId, limit);
  addUnique(skillGapCourses);

  if (interests.length > 0 && results.length < limit) {
    const interestMatches = await fetchCoursesByInterests(
      interests,
      userId,
      limit,
    );
    addUnique(interestMatches);
  }

  if (results.length < limit) {
    const excludeIds = Array.from(seenIds);
    const popular = await fetchPopularCourses(
      userId,
      limit - results.length,
      excludeIds,
    );
    addUnique(popular);
  }

  if (results.length < limit) {
    const excludeIds = Array.from(seenIds);
    const rated = await fetchHighlyRatedCourses(
      userId,
      limit - results.length,
      excludeIds,
    );
    addUnique(rated);
  }

  if (results.length < limit) {
    const excludeIds = Array.from(seenIds);
    const fallback = await fetchFallbackCourses(
      userId,
      limit - results.length,
      excludeIds,
    );
    addUnique(fallback);
  }

  return results;
}

const getCachedRecommendations = (
  userId: string,
  interests: string[],
  limit: number,
) =>
  unstable_cache(
    () => buildRecommendations(userId, interests, limit),
    [`recommendations`, userId],
    { revalidate: 300 },
  )();

export async function getRecommendedCourses(
  limit: number = 8,
): Promise<RecommendedCourse[]> {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return [];
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
      columns: { id: true, interests: true },
    });

    if (!user) {
      return [];
    }

    const interests = user.interests ?? [];

    return await getCachedRecommendations(user.id, interests, limit);
  } catch (error) {
    console.error("[GET_RECOMMENDED_COURSES]", error);
    return [];
  }
}
