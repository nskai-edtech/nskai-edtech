"use server";

import { db } from "@/lib/db";
import { userProgress, lessons, users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  checkModuleCompletion,
  checkModuleQuizzesPassed,
  awardPoints,
} from "@/actions/gamification/points";
import { checkCourseCompletionByLesson } from "@/actions/progress/queries";

const getDbUser = async (clerkId: string) => {
  return await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
    columns: { id: true },
  });
};

export async function markLessonComplete(lessonId: string) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { error: "Unauthorized" };

    const user = await getDbUser(clerkId);
    if (!user) return { error: "User not found" };

    await db
      .insert(userProgress)
      .values({
        userId: user.id,
        lessonId,
        isCompleted: true,
        lastAccessedAt: new Date(),
        lastPlaybackPosition: 0, // Reset on completion
      })
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.lessonId],
        set: {
          isCompleted: true,
          lastAccessedAt: new Date(),
          lastPlaybackPosition: 0,
        },
      });

    // GAMIFICATION: Award per-lesson XP + trigger module completion check
    const lessonData = await db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId),
      columns: { chapterId: true },
    });

    // Award individual lesson XP (deduplicated by unique index)
    const lessonResult = await awardPoints(
      user.id,
      2,
      "LESSON_COMPLETED",
      lessonId,
    );
    if (lessonResult && !lessonResult.success) {
      console.warn("[GAMIFICATION] Failed to award lesson XP for", lessonId);
    }

    if (lessonData?.chapterId) {
      const moduleResult = await checkModuleCompletion(
        user.id,
        lessonData.chapterId,
      );
      if (moduleResult && !moduleResult.success) {
        console.warn(
          "[GAMIFICATION] Failed to award module XP for chapter",
          lessonData.chapterId,
        );
      }
      // Also re-check quiz mastery — covers the case where quizzes were passed
      // before the last video lesson was completed
      const quizResult = await checkModuleQuizzesPassed(
        user.id,
        lessonData.chapterId,
      );
      if (quizResult && !quizResult.success) {
        console.warn(
          "[GAMIFICATION] Failed to award quiz mastery XP for chapter",
          lessonData.chapterId,
        );
      }
    }

    // Revalidate AFTER gamification writes to avoid serving stale XP
    revalidatePath("/learner/enrolled");
    revalidatePath("/learner");

    // Check if the entire course is now complete
    const completion = await checkCourseCompletionByLesson(user.id, lessonId);
    if (completion.courseCompleted) {
      return {
        success: true,
        courseCompleted: true,
        courseId: completion.courseId,
        courseTitle: completion.courseTitle,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("[MARK_LESSON_COMPLETE]", error);
    return { error: "Failed to mark lesson complete" };
  }
}

export async function updateLastAccessed(lessonId: string) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { error: "Unauthorized" };

    const user = await getDbUser(clerkId);
    if (!user) return { error: "User not found" };

    await db
      .insert(userProgress)
      .values({
        userId: user.id,
        lessonId,
        isCompleted: false,
        lastAccessedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.lessonId],
        set: { lastAccessedAt: new Date() },
      });

    return { success: true };
  } catch (error) {
    console.error("[UPDATE_LAST_ACCESSED]", error);
    return { error: "Failed to update last accessed" };
  }
}

export async function saveVideoPosition(lessonId: string, position: number) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { error: "Unauthorized" };

    const user = await getDbUser(clerkId);
    if (!user) return { error: "User not found" };

    await db
      .insert(userProgress)
      .values({
        userId: user.id,
        lessonId,
        isCompleted: false,
        lastAccessedAt: new Date(),
        lastPlaybackPosition: position,
      })
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.lessonId],
        set: { lastPlaybackPosition: position, lastAccessedAt: new Date() },
      });

    return { success: true };
  } catch (error) {
    console.error("[SAVE_VIDEO_POSITION]", error);
    return { error: "Failed to save video position" };
  }
}
