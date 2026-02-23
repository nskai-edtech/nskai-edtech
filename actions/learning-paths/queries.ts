"use server";

import { db } from "@/lib/db";
import {
  learningPaths,
  learningPathCourses,
  chapters,
  lessons,
} from "@/drizzle/schema";
import { eq, desc, count } from "drizzle-orm";

export async function fetchPublishedPathsWithCounts() {
  return await db
    .select({
      id: learningPaths.id,
      title: learningPaths.title,
      description: learningPaths.description,
      imageUrl: learningPaths.imageUrl,
      createdAt: learningPaths.createdAt,
      courseCount: count(learningPathCourses.id),
    })
    .from(learningPaths)
    .leftJoin(
      learningPathCourses,
      eq(learningPaths.id, learningPathCourses.learningPathId),
    )
    .where(eq(learningPaths.isPublished, true))
    .groupBy(learningPaths.id)
    .orderBy(desc(learningPaths.createdAt));
}

export async function fetchFullTrackData(pathId: string) {
  return await db.query.learningPathCourses.findMany({
    where: eq(learningPathCourses.learningPathId, pathId),
    orderBy: [learningPathCourses.position],
    with: {
      course: {
        with: {
          chapters: {
            orderBy: [chapters.position],
            with: {
              lessons: { orderBy: [lessons.position] },
            },
          },
        },
      },
    },
  });
}
