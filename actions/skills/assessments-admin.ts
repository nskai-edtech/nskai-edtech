"use server";

import { db } from "@/lib/db";
import { assessments } from "@/drizzle/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { AssessmentQuestion } from "./types";

// ─── Auth Helper ───
async function requireAdmin() {
  const { sessionClaims } = await auth();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    return null;
  }
  return true;
}

// ─── Create Assessment Question ───
export async function createAssessmentQuestion(data: {
  skillId: string;
  questionText: string;
  options: string[];
  correctOption: number;
  difficulty?: string;
}) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { error: "Unauthorized" };

  if (data.options.length < 2) {
    return { error: "At least 2 options are required" };
  }
  if (data.correctOption < 0 || data.correctOption >= data.options.length) {
    return { error: "Invalid correct option index" };
  }

  try {
    const [question] = await db
      .insert(assessments)
      .values({
        skillId: data.skillId,
        questionText: data.questionText,
        options: data.options,
        correctOption: data.correctOption,
        difficulty: data.difficulty || "BEGINNER",
      })
      .returning();

    revalidatePath(`/org/skills/${data.skillId}`);
    return { success: true, question };
  } catch (error) {
    console.error("[CREATE_ASSESSMENT_Q]", error);
    return { error: "Failed to create question" };
  }
}

// ─── Update Assessment Question ───
export async function updateAssessmentQuestion(
  assessmentId: string,
  data: {
    questionText?: string;
    options?: string[];
    correctOption?: number;
    difficulty?: string;
  },
) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { error: "Unauthorized" };

  if (data.options && data.options.length < 2) {
    return { error: "At least 2 options are required" };
  }
  if (
    data.options &&
    data.correctOption !== undefined &&
    (data.correctOption < 0 || data.correctOption >= data.options.length)
  ) {
    return { error: "Invalid correct option index" };
  }

  try {
    const [updated] = await db
      .update(assessments)
      .set(data)
      .where(eq(assessments.id, assessmentId))
      .returning();

    if (!updated) return { error: "Question not found" };

    revalidatePath(`/org/skills/${updated.skillId}`);
    return { success: true, question: updated };
  } catch (error) {
    console.error("[UPDATE_ASSESSMENT_Q]", error);
    return { error: "Failed to update question" };
  }
}

// ─── Delete Assessment Question ───
export async function deleteAssessmentQuestion(assessmentId: string) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { error: "Unauthorized" };

  try {
    const [deleted] = await db
      .delete(assessments)
      .where(eq(assessments.id, assessmentId))
      .returning({ skillId: assessments.skillId });

    if (deleted) {
      revalidatePath(`/org/skills/${deleted.skillId}`);
    }
    return { success: true };
  } catch (error) {
    console.error("[DELETE_ASSESSMENT_Q]", error);
    return { error: "Failed to delete question" };
  }
}

// ─── Get Assessment Questions (Admin — includes correctOption) ───
export async function getAssessmentQuestionsAdmin(
  skillId: string,
): Promise<{ error: string } | { questions: AssessmentQuestion[] }> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { error: "Unauthorized" };

  try {
    const rows = await db
      .select()
      .from(assessments)
      .where(eq(assessments.skillId, skillId))
      .orderBy(assessments.difficulty, assessments.createdAt);

    return {
      questions: rows.map((r) => ({
        id: r.id,
        skillId: r.skillId,
        questionText: r.questionText,
        options: r.options,
        correctOption: r.correctOption,
        difficulty: r.difficulty,
        createdAt: r.createdAt,
      })),
    };
  } catch (error) {
    console.error("[GET_ASSESSMENT_Q_ADMIN]", error);
    return { error: "Failed to load questions" };
  }
}
