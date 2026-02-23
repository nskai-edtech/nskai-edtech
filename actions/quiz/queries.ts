"use server";

import { db } from "@/lib/db";
import { quizQuestions, userQuizAttempts, users } from "@/drizzle/schema";
import { eq, and, asc, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { QuizQuestion, QuizQuestionWithAnswer } from "./types";

// Helper to grab the DB user ID
const getDbUserId = async (clerkId: string) => {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
    columns: { id: true },
  });
  return user?.id || null;
};

// ─── Get Quiz Questions (Learner View) ───
export async function getQuizQuestions(
  lessonId: string,
): Promise<{ error: string } | { questions: QuizQuestion[] }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Unauthorized" };

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

// ─── Get Last Attempt ───
export async function getLastQuizAttempt(lessonId: string): Promise<{
  score: number;
  passed: boolean;
  completedAt: Date;
  answers?: Record<string, number> | null;
} | null> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const userId = await getDbUserId(clerkId);
  if (!userId) return null;

  const attempt = await db.query.userQuizAttempts.findFirst({
    where: and(
      eq(userQuizAttempts.userId, userId),
      eq(userQuizAttempts.lessonId, lessonId),
    ),
    orderBy: [desc(userQuizAttempts.completedAt)],
  });

  if (!attempt) return null;
  return {
    score: attempt.score,
    passed: attempt.passed,
    completedAt: attempt.completedAt,
    answers: attempt.answers as Record<string, number>,
  };
}

// ─── Get Quiz Questions (Admin/Tutor View) ───
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

  return { questions: rows as QuizQuestionWithAnswer[] };
}
