import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lessons, quizQuestions } from "@/drizzle/schema/courses";
import { assignments } from "@/drizzle/schema/assessments";
import { eq } from "drizzle-orm";

interface QuizQuestionPayload {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
}

interface WebhookPayload {
  lessonId: string;
  summary?: string;
  notes?: string;
  assessmentPrompt?: string;
  quizzes?: QuizQuestionPayload[];
}

export async function POST(req: Request) {
  try {
    const secret = req.headers.get("x-ai-secret");
    if (secret !== process.env.AI_WEBHOOK_SECRET) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = (await req.json()) as WebhookPayload;
    const { lessonId, summary, notes, assessmentPrompt, quizzes } = body;

    if (!lessonId) {
      return new NextResponse("Missing lessonId", { status: 400 });
    }

    const lesson = await db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId),
      with: {
        chapter: true,
      },
    });

    if (!lesson || !lesson.chapter || !lesson.chapter.courseId) {
      return new NextResponse("Lesson, Chapter, or Course ID not found", {
        status: 404,
      });
    }

    const courseId = lesson.chapter.courseId;

    if (summary || notes) {
      await db
        .update(lessons)
        .set({
          ...(summary && { description: summary }),
          ...(notes && { notes: notes }),
        })
        .where(eq(lessons.id, lessonId));
    }

    // B. Insert Quiz Questions
    if (quizzes && Array.isArray(quizzes) && quizzes.length > 0) {
      const formattedQuizzes = quizzes.map(
        (q: QuizQuestionPayload, index: number) => ({
          lessonId: lessonId,
          questionText: q.questionText,
          options: q.options,
          correctOption: q.correctOptionIndex,
          position: index,
        }),
      );

      await db.insert(quizQuestions).values(formattedQuizzes);
    }

    // C. Upsert the Assessment (Project)
    if (assessmentPrompt) {
      await db
        .insert(assignments)
        .values({
          lessonId: lessonId,
          courseId: courseId,
          title: `Practical Assessment: ${lesson.title}`,
          description: assessmentPrompt,
          maxScore: 100,
        })
        .onConflictDoUpdate({
          target: assignments.lessonId,
          set: { description: assessmentPrompt },
        });
    }

    return NextResponse.json({
      success: true,
      message: "AI assets saved successfully",
    });
  } catch (error) {
    console.error("[AI_WEBHOOK_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
