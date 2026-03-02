"use server";

import { db } from "@/lib/db";
import {
  quizQuestions,
  userQuizAttempts,
  userProgress,
  lessons,
  users,
  muxData as muxDataTable,
} from "@/drizzle/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  awardPoints,
  checkModuleCompletion,
  checkModuleQuizzesPassed,
} from "../gamification/points";
import { checkCourseCompletionByLesson } from "@/actions/progress/queries";

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

  let savedQuestion;

  if (questionId) {
    await db
      .update(quizQuestions)
      .set(data)
      .where(eq(quizQuestions.id, questionId));
    savedQuestion = await db.query.quizQuestions.findFirst({
      where: eq(quizQuestions.id, questionId),
    });
  } else {
    const inserted = await db
      .insert(quizQuestions)
      .values({ lessonId, ...data })
      .returning();
    savedQuestion = inserted[0];
  }

  await db
    .update(lessons)
    .set({ type: "QUIZ" })
    .where(eq(lessons.id, lessonId));

  revalidatePath(`/tutor/courses`);
  revalidatePath(`/watch`, "layout");
  return { success: true, question: savedQuestion };
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
): Promise<
  | { error: string }
  | {
      score: number;
      passed: boolean;
      courseCompleted?: boolean;
      courseId?: string;
      courseTitle?: string;
    }
> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Unauthorized" };

  const userId = await getDbUserId(clerkId);
  if (!userId) return { error: "User not found" };

  const [rows, lessonData, muxRow] = await Promise.all([
    db.select().from(quizQuestions).where(eq(quizQuestions.lessonId, lessonId)),
    db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId),
      columns: { chapterId: true },
    }),
    db.query.muxData.findFirst({
      where: eq(muxDataTable.lessonId, lessonId),
      columns: { id: true },
    }),
  ]);

  if (rows.length === 0) return { error: "No questions found for this quiz" };

  // Server-side guard: if the lesson has a video, the learner must watch it first
  if (muxRow) {
    const progress = await db.query.userProgress.findFirst({
      where: and(
        eq(userProgress.userId, userId),
        eq(userProgress.lessonId, lessonId),
      ),
      columns: { isCompleted: true },
    });
    if (!progress?.isCompleted) {
      return { error: "You must watch the video before taking this quiz" };
    }
  }

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
  }

  // GAMIFICATION: Award per-quiz XP + trigger module completion & quiz mastery checks
  if (passed) {
    const quizResult = await awardPoints(userId, 5, "QUIZ_PASSED", lessonId);
    if (quizResult && !quizResult.success) {
      console.warn("[GAMIFICATION] Failed to award quiz XP for", lessonId);
    }
  }

  if (lessonData?.chapterId) {
    if (passed) {
      const moduleResult = await checkModuleCompletion(
        userId,
        lessonData.chapterId,
      );
      if (moduleResult && !moduleResult.success) {
        console.warn(
          "[GAMIFICATION] Failed to award module XP for chapter",
          lessonData.chapterId,
        );
      }
    }
    const quizMasteryResult = await checkModuleQuizzesPassed(
      userId,
      lessonData.chapterId,
    );
    if (quizMasteryResult && !quizMasteryResult.success) {
      console.warn(
        "[GAMIFICATION] Failed to award quiz mastery XP for chapter",
        lessonData.chapterId,
      );
    }
  }

  // Revalidate AFTER gamification writes to avoid serving stale XP
  if (passed) {
    revalidatePath("/learner");
  }

  // Check if the entire course is now complete
  if (passed) {
    const completion = await checkCourseCompletionByLesson(userId, lessonId);
    if (completion.courseCompleted) {
      return {
        score,
        passed,
        courseCompleted: true,
        courseId: completion.courseId,
        courseTitle: completion.courseTitle,
      };
    }
  }

  return { score, passed };
}
