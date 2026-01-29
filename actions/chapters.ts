"use server";

import { db } from "@/lib/db";
import { chapters, lessons } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

// Chapter Actions

export async function createChapter(courseId: string, title: string) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    // Get the max position for this course
    const existingChapters = await db
      .select({ position: chapters.position })
      .from(chapters)
      .where(eq(chapters.courseId, courseId))
      .orderBy(chapters.position);

    const maxPosition =
      existingChapters.length > 0
        ? Math.max(...existingChapters.map((c) => c.position))
        : 0;

    const [newChapter] = await db
      .insert(chapters)
      .values({
        courseId,
        title,
        position: maxPosition + 1,
      })
      .returning();

    return { success: true, chapter: newChapter };
  } catch (error) {
    console.error("Error creating chapter:", error);
    return { error: "Failed to create chapter" };
  }
}

export async function updateChapter(
  chapterId: string,
  data: { title?: string; position?: number },
) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    const [updatedChapter] = await db
      .update(chapters)
      .set(data)
      .where(eq(chapters.id, chapterId))
      .returning();

    return { success: true, chapter: updatedChapter };
  } catch (error) {
    console.error("Error updating chapter:", error);
    return { error: "Failed to update chapter" };
  }
}

export async function deleteChapter(chapterId: string) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    await db.delete(chapters).where(eq(chapters.id, chapterId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting chapter:", error);
    return { error: "Failed to delete chapter" };
  }
}

export async function reorderChapters(courseId: string, chapterIds: string[]) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    // Update positions for each chapter
    await Promise.all(
      chapterIds.map((id, index) =>
        db
          .update(chapters)
          .set({ position: index + 1 })
          .where(and(eq(chapters.id, id), eq(chapters.courseId, courseId))),
      ),
    );

    return { success: true };
  } catch (error) {
    console.error("Error reordering chapters:", error);
    return { error: "Failed to reorder chapters" };
  }
}

// Lesson Actions

export async function createLesson(chapterId: string, title: string) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    // Get the max position for this chapter
    const existingLessons = await db
      .select({ position: lessons.position })
      .from(lessons)
      .where(eq(lessons.chapterId, chapterId))
      .orderBy(lessons.position);

    const maxPosition =
      existingLessons.length > 0
        ? Math.max(...existingLessons.map((l) => l.position))
        : 0;

    const [newLesson] = await db
      .insert(lessons)
      .values({
        chapterId,
        title,
        position: maxPosition + 1,
        isFreePreview: false,
      })
      .returning();

    return { success: true, lesson: newLesson };
  } catch (error) {
    console.error("Error creating lesson:", error);
    return { error: "Failed to create lesson" };
  }
}

export async function updateLesson(
  lessonId: string,
  data: {
    title?: string;
    description?: string;
    videoUrl?: string;
    position?: number;
    isFreePreview?: boolean;
  },
) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    const [updatedLesson] = await db
      .update(lessons)
      .set(data)
      .where(eq(lessons.id, lessonId))
      .returning();

    return { success: true, lesson: updatedLesson };
  } catch (error) {
    console.error("Error updating lesson:", error);
    return { error: "Failed to update lesson" };
  }
}

export async function deleteLesson(lessonId: string) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    await db.delete(lessons).where(eq(lessons.id, lessonId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting lesson:", error);
    return { error: "Failed to delete lesson" };
  }
}

export async function reorderLessons(chapterId: string, lessonIds: string[]) {
  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized" };
  }

  try {
    // Update positions for each lesson
    await Promise.all(
      lessonIds.map((id, index) =>
        db
          .update(lessons)
          .set({ position: index + 1 })
          .where(and(eq(lessons.id, id), eq(lessons.chapterId, chapterId))),
      ),
    );

    return { success: true };
  } catch (error) {
    console.error("Error reordering lessons:", error);
    return { error: "Failed to reorder lessons" };
  }
}
