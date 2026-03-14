"use server";

import { db } from "@/lib/db";
import {
  assessments,
  userAssessmentResults,
  userSkills,
  skills,
  users,
} from "@/drizzle/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, sql, inArray, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { awardPoints } from "@/actions/gamification/points";
import type {
  AssessmentQuestionLearner,
  DiagnosticResult,
  DiagnosticSubmission,
} from "./types";

// ─── Helper: get DB user ID from Clerk ───
async function getDbUser(clerkId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
    columns: { id: true, interests: true },
  });
  return user;
}

// ─── Start Diagnostic ───
// Fetches assessment questions for the given skills (or skills matching user interests).
// Returns questions WITHOUT correctOption for the learner.
export async function startDiagnostic(
  skillIds?: string[],
): Promise<
  | { error: string }
  | { questions: AssessmentQuestionLearner[]; skillMap: Record<string, string> }
> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Unauthorized" };

  const user = await getDbUser(clerkId);
  if (!user) return { error: "User not found" };

  try {
    let targetSkillIds = skillIds;

    // If no specific skills, find skills matching user interests
    if (!targetSkillIds || targetSkillIds.length === 0) {
      const userInterests = user.interests ?? [];
      if (userInterests.length > 0) {
        const matchedSkills = await db
          .select({ id: skills.id })
          .from(skills)
          .where(inArray(skills.category, userInterests));
        targetSkillIds = matchedSkills.map((s) => s.id);
      }

      // If still empty, grab all skills that have questions
      if (!targetSkillIds || targetSkillIds.length === 0) {
        const allSkillsWithQs = await db.execute(sql`
          SELECT DISTINCT skill_id AS "skillId"
          FROM assessment
          LIMIT 50
        `);
        targetSkillIds = (allSkillsWithQs.rows ?? allSkillsWithQs).map(
          (r: Record<string, unknown>) => r.skillId as string,
        );
      }
    }

    if (targetSkillIds.length === 0) {
      return { error: "No assessment questions available" };
    }

    // Fetch up to 5 questions per skill, mixing difficulties
    // Uses a window function to select a balanced set
    const skillIdList = sql.join(
      targetSkillIds.map((id) => sql`${id}::uuid`),
      sql`, `,
    );
    const rows = await db.execute(sql`
      SELECT q.id, q.skill_id AS "skillId", q.question_text AS "questionText",
             q.options, q.difficulty
      FROM (
        SELECT *,
          ROW_NUMBER() OVER (
            PARTITION BY skill_id
            ORDER BY
              CASE difficulty
                WHEN 'BEGINNER' THEN 1
                WHEN 'INTERMEDIATE' THEN 2
                WHEN 'ADVANCED' THEN 3
                ELSE 4
              END,
              RANDOM()
          ) AS rn
        FROM assessment
        WHERE skill_id = ANY(ARRAY[${skillIdList}])
      ) q
      WHERE q.rn <= 5
      ORDER BY RANDOM()
    `);

    const questions: AssessmentQuestionLearner[] = (rows.rows ?? rows).map(
      (r: Record<string, unknown>) => ({
        id: r.id as string,
        skillId: r.skillId as string,
        questionText: r.questionText as string,
        options: r.options as string[],
        difficulty: r.difficulty as string | null,
      }),
    );

    if (questions.length === 0) {
      return { error: "No assessment questions available for selected skills" };
    }

    // Build a skill name map for the client
    const uniqueSkillIds = [...new Set(questions.map((q) => q.skillId))];
    const skillRows = await db
      .select({ id: skills.id, title: skills.title })
      .from(skills)
      .where(inArray(skills.id, uniqueSkillIds));
    const skillMap: Record<string, string> = {};
    skillRows.forEach((s) => {
      skillMap[s.id] = s.title;
    });

    return { questions, skillMap };
  } catch (error) {
    console.error("[START_DIAGNOSTIC]", error);
    return { error: "Failed to load diagnostic assessment" };
  }
}

// ─── Submit Diagnostic ───
// Grades answers, updates mastery scores, awards XP.
export async function submitDiagnostic(
  answers: Record<string, number>,
): Promise<{ error: string } | DiagnosticSubmission> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Unauthorized" };

  const user = await getDbUser(clerkId);
  if (!user) return { error: "User not found" };

  const questionIds = Object.keys(answers);
  if (questionIds.length === 0) return { error: "No answers provided" };

  try {
    // Fetch the actual questions with correct answers
    const questions = await db
      .select()
      .from(assessments)
      .where(inArray(assessments.id, questionIds));

    if (questions.length === 0) return { error: "No valid questions found" };

    // Grade each answer and build results per skill
    const skillResults: Record<
      string,
      { correct: number; total: number; skillId: string }
    > = {};

    const resultInserts: {
      userId: string;
      assessmentId: string;
      isCorrect: boolean;
    }[] = [];

    for (const q of questions) {
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correctOption;

      if (!skillResults[q.skillId]) {
        skillResults[q.skillId] = { correct: 0, total: 0, skillId: q.skillId };
      }
      skillResults[q.skillId].total++;
      if (isCorrect) skillResults[q.skillId].correct++;

      resultInserts.push({
        userId: user.id,
        assessmentId: q.id,
        isCorrect,
      });
    }

    // Bulk insert assessment results
    if (resultInserts.length > 0) {
      await db.insert(userAssessmentResults).values(resultInserts);
    }

    // Get existing mastery scores for comparison
    const skillIdList = Object.keys(skillResults);
    const existingMastery = await db
      .select()
      .from(userSkills)
      .where(
        and(
          eq(userSkills.userId, user.id),
          inArray(userSkills.skillId, skillIdList),
        ),
      );
    const existingMap: Record<string, number> = {};
    existingMastery.forEach((m) => {
      existingMap[m.skillId] = m.masteryScore;
    });

    // Get skill titles for response
    const skillRows = await db
      .select({ id: skills.id, title: skills.title, category: skills.category })
      .from(skills)
      .where(inArray(skills.id, skillIdList));
    const skillInfoMap: Record<string, { title: string; category: string }> =
      {};
    skillRows.forEach((s) => {
      skillInfoMap[s.id] = { title: s.title, category: s.category };
    });

    // Upsert mastery scores per skill
    const diagnosticResults: DiagnosticResult[] = [];
    let totalCorrect = 0;
    let totalQuestions = 0;
    let xpAwarded = 0;

    for (const [skillId, result] of Object.entries(skillResults)) {
      const masteryScore = Math.round((result.correct / result.total) * 100);
      const previousScore = existingMap[skillId] ?? null;

      await db
        .insert(userSkills)
        .values({
          userId: user.id,
          skillId,
          masteryScore,
        })
        .onConflictDoUpdate({
          target: [userSkills.userId, userSkills.skillId],
          set: {
            masteryScore,
            lastAssessedAt: new Date(),
          },
        });

      totalCorrect += result.correct;
      totalQuestions += result.total;

      // Award SKILL_MASTERED XP if mastery reaches ≥80 for the first time
      if (
        masteryScore >= 80 &&
        (previousScore === null || previousScore < 80)
      ) {
        const xpResult = await awardPoints(
          user.id,
          25,
          "SKILL_MASTERED",
          skillId,
        );
        if (xpResult?.awarded) xpAwarded += 25;
      }

      diagnosticResults.push({
        skillId,
        skillTitle: skillInfoMap[skillId]?.title ?? "Unknown",
        skillCategory: skillInfoMap[skillId]?.category ?? "Unknown",
        correct: result.correct,
        total: result.total,
        masteryScore,
        previousScore,
      });
    }

    // Award DIAGNOSTIC_COMPLETED XP (deduplicated by date to allow daily retakes)
    const today = new Date().toISOString().split("T")[0];
    const diagResult = await awardPoints(
      user.id,
      15,
      "DIAGNOSTIC_COMPLETED",
      `diagnostic_${today}`,
    );
    if (diagResult?.awarded) xpAwarded += 15;

    // Mark diagnostic as completed on user
    await db
      .update(users)
      .set({ diagnosticCompletedAt: new Date() })
      .where(eq(users.id, user.id));

    const overallScore = Math.round((totalCorrect / totalQuestions) * 100);

    revalidatePath("/learner");
    revalidatePath("/learner/skills");

    return {
      results: diagnosticResults.sort(
        (a, b) => a.masteryScore - b.masteryScore,
      ),
      totalCorrect,
      totalQuestions,
      overallScore,
      xpAwarded,
    };
  } catch (error) {
    console.error("[SUBMIT_DIAGNOSTIC]", error);
    return { error: "Failed to submit diagnostic" };
  }
}
