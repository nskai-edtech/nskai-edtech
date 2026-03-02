"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { generateLessonAssets } from "@/lib/ai-service";

/**
 * Trigger AI generation of lesson assets (summary, notes, quizzes)
 * from a video transcript. Results arrive via webhook.
 *
 * Only tutors / admins should call this.
 */
export async function triggerLessonAssetGeneration(
  lessonId: string,
  transcriptUrl: string,
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { error: "Unauthorized" };

    // Verify the user is a tutor or admin
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
      columns: { id: true, role: true },
    });

    if (!user || (user.role !== "TUTOR" && user.role !== "ADMIN")) {
      return { error: "Forbidden" };
    }

    // Build the webhook URL that the AI Core will call back
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const webhookUrl = `${baseUrl}/api/ai/lesson-assets`;

    const result = await generateLessonAssets({
      lessonId,
      transcriptUrl,
      webhookUrl,
    });

    return { success: true, status: result.status, message: result.message };
  } catch (error) {
    console.error("[TRIGGER_LESSON_ASSETS]", error);
    return { error: "Failed to trigger asset generation" };
  }
}
