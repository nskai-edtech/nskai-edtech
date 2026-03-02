import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { lessons } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Webhook endpoint for AI-generated lesson assets.
 *
 * The AI Core calls this URL after finishing asset generation,
 * POSTing the results (summary, notes, quizzes, assessment) for a lesson.
 *
 * Protected by the shared AI_WEBHOOK_SECRET.
 */
export async function POST(req: Request) {
  try {
    // ── Verify webhook secret ──
    const headersList = await headers();
    const secret = headersList.get("x-ai-secret");
    if (!secret || secret !== process.env.AI_WEBHOOK_SECRET) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { lessonId, status, assets } = body;

    if (!lessonId || status !== "success" || !assets) {
      console.warn("[LESSON_ASSETS_WEBHOOK] Invalid payload:", {
        lessonId,
        status,
      });
      return NextResponse.json({ received: true, processed: false });
    }

    // Verify the lesson exists
    const lesson = await db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId),
      columns: { id: true },
    });

    if (!lesson) {
      console.warn("[LESSON_ASSETS_WEBHOOK] Lesson not found:", lessonId);
      return NextResponse.json({ received: true, processed: false });
    }

    // ── Persist generated assets ──
    // The exact fields depend on your schema. Common pattern: update the lesson
    // with summary/notes, and insert quiz questions into assessments table.
    // For now we log and acknowledge — extend as your schema supports it.
    console.log(
      `[LESSON_ASSETS_WEBHOOK] Received assets for lesson ${lessonId}:`,
      Object.keys(assets),
    );

    // Example: If your lessons table has a `summary` or `aiNotes` column:
    // await db.update(lessons).set({
    //   summary: assets.summary,
    //   aiNotes: assets.notes,
    // }).where(eq(lessons.id, lessonId));

    // Example: If assets include quizzes, insert them:
    // if (assets.quizzes) {
    //   for (const quiz of assets.quizzes) {
    //     await db.insert(quizQuestions).values({ lessonId, ...quiz });
    //   }
    // }

    return NextResponse.json({ received: true, processed: true });
  } catch (error) {
    console.error("[LESSON_ASSETS_WEBHOOK_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
