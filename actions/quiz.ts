"use server";

import { db } from "@/lib/db";
import {
  quizQuestions,
  userQuizAttempts,
  userProgress,
  lessons,
  users,
} from "@/drizzle/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { checkModuleQuizzesPassed } from "./gamification";

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  position: number;
}

export interface QuizQuestionWithAnswer extends QuizQuestion {
  correctOption: number;
}

export async function saveQuizQuestion(
  lessonId: string,
  data: {
    questionText: string;
    options: string[];
    correctOption: number;
    position: number;
  },
  questionId?: string,
) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  // Verify lessonId exists
  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
  });
  if (!lesson) return { error: "Lesson not found" };

  if (questionId) {
    // Update
    await db
      .update(quizQuestions)
      .set({
        questionText: data.questionText,
        options: data.options,
        correctOption: data.correctOption,
        position: data.position,
      })
      .where(eq(quizQuestions.id, questionId));
  } else {
    // Create
    await db.insert(quizQuestions).values({
      lessonId,
      questionText: data.questionText,
      options: data.options,
      correctOption: data.correctOption,
      position: data.position,
    });
  }

  revalidatePath(`/tutor/courses`);
  return { success: true };
}

export async function deleteQuizQuestion(questionId: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  await db.delete(quizQuestions).where(eq(quizQuestions.id, questionId));
  revalidatePath(`/tutor/courses`);
  return { success: true };
}

export async function getQuizQuestions(
  lessonId: string,
): Promise<{ error: string } | { questions: QuizQuestion[] }> {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const rows = await db
    .select({
      id: quizQuestions.id,
      questionText: quizQuestions.questionText,
      options: quizQuestions.options,
      position: quizQuestions.position,
    })
    .from(quizQuestions)
    .where(eq(quizQuestions.lessonId, lessonId))
    .orderBy(asc(quizQuestions.position));

  return { questions: rows };
}
export async function submitQuiz(
  lessonId: string,
  answers: Record<string, number>,
): Promise<{ error: string } | { score: number; passed: boolean }> {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  if (!user) return { error: "User not found" };

  // Fetch the full questions including correct options
  const rows = await db
    .select()
    .from(quizQuestions)
    .where(eq(quizQuestions.lessonId, lessonId));

  if (rows.length === 0) return { error: "No questions found for this quiz" };

  // Calculate score
  const correct = rows.filter((q) => answers[q.id] === q.correctOption).length;
  const score = Math.round((correct / rows.length) * 100);
  const passed = score >= 70;

  // Record the attempt
  await db.insert(userQuizAttempts).values({
    userId: user.id,
    lessonId,
    score,
    passed,
  });

  // If passed, mark lesson as complete
  if (passed) {
    await db
      .insert(userProgress)
      .values({
        userId: user.id,
        lessonId,
        isCompleted: true,
        lastAccessedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.lessonId],
        set: { isCompleted: true, lastAccessedAt: new Date() },
      });

    revalidatePath("/learner");
  }

  // GAMIFICATION: Trigger Quiz Mastery module check
  // We need the chapterId to check if all quizzes in the module scored > 75%
  const lessonData = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
  });
  if (lessonData?.chapterId) {
    await checkModuleQuizzesPassed(user.id, lessonData.chapterId);
  }

  return { score, passed };
}

// ─── Get Last Attempt ─────────────────────────────────────────────────────────

export async function getLastQuizAttempt(lessonId: string): Promise<{
  score: number;
  passed: boolean;
  completedAt: Date;
} | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  if (!user) return null;

  const attempt = await db.query.userQuizAttempts.findFirst({
    where: and(
      eq(userQuizAttempts.userId, user.id),
      eq(userQuizAttempts.lessonId, lessonId),
    ),
    orderBy: (t, { desc }) => [desc(t.completedAt)],
  });

  if (!attempt) return null;
  return {
    score: attempt.score,
    passed: attempt.passed,
    completedAt: attempt.completedAt,
  };
}

// ─── Tutor: Get Quiz Questions with Answers ───────────────────────────────────

export async function getQuizQuestionsAdmin(
  lessonId: string,
): Promise<{ error: string } | { questions: QuizQuestionWithAnswer[] }> {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const rows = await db
    .select()
    .from(quizQuestions)
    .where(eq(quizQuestions.lessonId, lessonId))
    .orderBy(asc(quizQuestions.position));

  return { questions: rows };
}
