"use server";

import { db } from "@/lib/db";
import { questions, answers, users } from "@/drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import { QuestionWithRelations } from "@/types";

export async function getQuestions(
  lessonId: string,
): Promise<{ questions?: QuestionWithRelations[]; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const result = await db.query.questions.findMany({
      where: eq(questions.lessonId, lessonId),
      orderBy: [desc(questions.createdAt)],
      with: {
        user: true,
        answers: {
          with: {
            user: true,
          },
          orderBy: [desc(answers.createdAt)],
        },
      },
    });

    return { questions: result as QuestionWithRelations[] };
  } catch (error) {
    console.error("[GET_QUESTIONS]", error);
    return { error: "Failed to fetch questions" };
  }
}

export async function askQuestion(lessonId: string, content: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) return { error: "User not found" };

    await db.insert(questions).values({
      userId: user.id,
      lessonId,
      content,
    });

    revalidatePath(`/watch`);
    return { success: true };
  } catch (error) {
    console.error("[ASK_QUESTION]", error);
    return { error: "Failed to post question" };
  }
}

export async function answerQuestion(questionId: string, content: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) return { error: "User not found" };

    await db.insert(answers).values({
      userId: user.id,
      questionId,
      content,
    });

    revalidatePath(`/watch`);
    return { success: true };
  } catch (error) {
    console.error("[ANSWER_QUESTION]", error);
    return { error: "Failed to post answer" };
  }
}

export async function deleteQuestion(questionId: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { error: "Unauthorized" };

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) return { error: "User not found" };

    // Check ownership or admin status (simplified to start)
    const question = await db.query.questions.findFirst({
      where: and(eq(questions.id, questionId), eq(questions.userId, user.id)),
    });

    if (!question) return { error: "Unauthorized" };

    await db.delete(questions).where(eq(questions.id, questionId));
    revalidatePath(`/watch`);
    return { success: true };
  } catch (error) {
    console.error("[DELETE_QUESTION]", error);
    return { error: "Failed to delete question" };
  }
}
