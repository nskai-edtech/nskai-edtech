"use server";

import { db } from "@/lib/db";
import { userProgress, lessons, users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { checkModuleCompletion } from "@/actions/gamification/points";

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

    revalidatePath("/learner/enrolled");
    revalidatePath("/learner");

    // GAMIFICATION: Trigger Module completion check
    const lessonData = await db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId),
      columns: { chapterId: true },
    });

    if (lessonData?.chapterId) {
      await checkModuleCompletion(user.id, lessonData.chapterId);
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
