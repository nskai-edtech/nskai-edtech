"use server";

import { db } from "@/lib/db";
import { userNotes, users } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

// FETCH USER NOTE
export async function getUserNote(lessonId: string) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { error: "Unauthorized" };

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
      columns: { id: true },
    });

    if (!user) return { error: "User not found" };

    const note = await db.query.userNotes.findFirst({
      where: and(
        eq(userNotes.userId, user.id),
        eq(userNotes.lessonId, lessonId),
      ),
    });

    return { note: note || null };
  } catch (error) {
    console.error("[GET_USER_NOTE]", error);
    return { error: "Internal Server Error" };
  }
}

// SAVE OR UPDATE USER NOTE
export async function saveUserNote(lessonId: string, content: string) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { error: "Unauthorized" };

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
      columns: { id: true },
    });

    if (!user) return { error: "User not found" };

    await db
      .insert(userNotes)
      .values({
        userId: user.id,
        lessonId,
        content,
      })
      .onConflictDoUpdate({
        target: [userNotes.userId, userNotes.lessonId],
        set: {
          content,
          updatedAt: new Date(),
        },
      });

    return { success: true };
  } catch (error) {
    console.error("[SAVE_USER_NOTE]", error);
    return { error: "Failed to save note" };
  }
}
