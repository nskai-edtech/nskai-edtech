"use server";

import { db } from "@/lib/db";
import { userNotes } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { users } from "@/drizzle/schema";

export async function getUserNote(lessonId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return { error: "User not found" };
    }

    const note = await db.query.userNotes.findFirst({
      where: and(
        eq(userNotes.userId, user.id),
        eq(userNotes.lessonId, lessonId),
      ),
    });

    return { note };
  } catch (error) {
    console.error("[GET_USER_NOTE]", error);
    return { error: "Failed to get user note" };
  }
}

export async function saveUserNote(lessonId: string, content: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return { error: "User not found" };
    }

    const existingNote = await db.query.userNotes.findFirst({
      where: and(
        eq(userNotes.userId, user.id),
        eq(userNotes.lessonId, lessonId),
      ),
    });

    if (existingNote) {
      await db
        .update(userNotes)
        .set({
          content,
          updatedAt: new Date(),
        })
        .where(eq(userNotes.id, existingNote.id));
    } else {
      await db.insert(userNotes).values({
        userId: user.id,
        lessonId,
        content,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("[SAVE_USER_NOTE]", error);
    return { error: "Failed to save user note" };
  }
}
