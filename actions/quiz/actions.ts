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
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { checkModuleQuizzesPassed } from "../gamification/points";

// Helper
const getDbUserId = async (clerkId: string) => {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
    columns: { id: true },
  });
  return user?.id || null;
};

// ─── Save Question ───
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

  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    columns: { id: true },
  });
  if (!lesson) return { error: "Lesson not found" };

  if (questionId) {
    await db
      .update(quizQuestions)
      .set(data)
      .where(eq(quizQuestions.id, questionId));
  } else {
    await db.insert(quizQuestions).values({ lessonId, ...data });
  }

  revalidatePath(`/tutor/courses`);
  return { success: true };
}

// ─── Delete Question ───
export async function deleteQuizQuestion(questionId: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  await db.delete(quizQuestions).where(eq(quizQuestions.id, questionId));
  revalidatePath(`/tutor/courses`);
  return { success: true };
}

// ─── Submit Quiz ───
export async function submitQuiz(
  lessonId: string,
  answers: Record<string, number>,
): Promise<{ error: string } | { score: number; passed: boolean }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Unauthorized" };

  const userId = await getDbUserId(clerkId);
  if (!userId) return { error: "User not found" };

  const [rows, lessonData] = await Promise.all([
    db.select().from(quizQuestions).where(eq(quizQuestions.lessonId, lessonId)),
    db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId),
      columns: { chapterId: true },
    }),
  ]);

  if (rows.length === 0) return { error: "No questions found for this quiz" };

  const correct = rows.filter((q) => answers[q.id] === q.correctOption).length;
  const score = Math.round((correct / rows.length) * 100);
  const passed = score >= 70;

  await db.insert(userQuizAttempts).values({
    userId,
    lessonId,
    score,
    passed,
    answers,
  });

  if (passed) {
    await db
      .insert(userProgress)
      .values({
        userId,
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
  if (lessonData?.chapterId) {
    await checkModuleQuizzesPassed(userId, lessonData.chapterId);
  }

  return { score, passed };
}
