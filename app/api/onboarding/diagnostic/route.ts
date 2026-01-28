import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { assessments, userSkills, userAssessmentResults, skills, users } from "@/drizzle/schema";
import { eq, inArray, sql } from "drizzle-orm";

interface DiagnosticSubmission {
  answers: {
    assessmentId: string;
    selectedOptionIndex: number;
  }[];
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body: DiagnosticSubmission = await req.json();
    const { answers } = body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return new NextResponse("Invalid submission data", { status: 400 });
    }

    // 1. Fetch all relevant assessments from DB to get correct answers
    const assessmentIds = answers.map((a) => a.assessmentId);
    const dbAssessments = await db.query.assessments.findMany({
      where: inArray(assessments.id, assessmentIds),
      with: {
        skill: true,
      },
    });

    const assessmentMap = new Map(dbAssessments.map((a) => [a.id, a]));

    // Track scores per Skill Category (e.g., Frontend, Backend)
    const categoryScores: Record<string, { total: number; correct: number }> = {};
    const skillMasteryUpdates: Record<string, { total: number; correct: number }> = {};
    const resultsToInsert: typeof userAssessmentResults.$inferInsert[] = [];

    // Get internal User ID from Clerk ID
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return new NextResponse("User not found in database", { status: 404 });
    }

    const internalUserId = user.id;

    // 2. Process each answer
    for (const answer of answers) {
      const assessment = assessmentMap.get(answer.assessmentId);

      if (!assessment) continue; // Skip if ID invalid

      const isCorrect = assessment.correctOption === answer.selectedOptionIndex;
      const category = assessment.skill.category;
      const skillId = assessment.skill.id;

      // Update Category Scores
      if (!categoryScores[category]) categoryScores[category] = { total: 0, correct: 0 };
      categoryScores[category].total++;
      if (isCorrect) categoryScores[category].correct++;

      // Update Specific Skill Mastery
      if (!skillMasteryUpdates[skillId]) skillMasteryUpdates[skillId] = { total: 0, correct: 0 };
      skillMasteryUpdates[skillId].total++;
      if (isCorrect) skillMasteryUpdates[skillId].correct++;

      // Prepare Result Log
      resultsToInsert.push({
        userId: internalUserId,
        assessmentId: assessment.id,
        isCorrect,
      });
    }

    // 3. Batch Insert Assessment Results
    if (resultsToInsert.length > 0) {
      await db.insert(userAssessmentResults).values(resultsToInsert);
    }

    // 4. Update User Skills (Radar Chart Data)
    // We calculate a simple percentage for now: (Correct / Total) * 100
    for (const [skillId, scoreData] of Object.entries(skillMasteryUpdates)) {
      const masteryPercentage = Math.round((scoreData.correct / scoreData.total) * 100);

      // Upsert User Skill
      await db
        .insert(userSkills)
        .values({
          userId: internalUserId,
          skillId,
          masteryScore: masteryPercentage,
          lastAssessedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [userSkills.userId, userSkills.skillId],
          set: {
            masteryScore: masteryPercentage,
            lastAssessedAt: new Date(),
          },
        });
    }

    // 5. Determine Recommended Track (Highest Scoring Category)
    let bestCategory = "General";
    let maxScore = -1;

    for (const [category, scoreData] of Object.entries(categoryScores)) {
      const percentage = (scoreData.correct / scoreData.total) * 100;
      if (percentage > maxScore) {
        maxScore = percentage;
        bestCategory = category;
      }
    }

    return NextResponse.json({
      message: "Diagnostic completed",
      results: {
        categoryScores,
        recommendedTrack: bestCategory
      }
    });

  } catch (error) {
    console.error("[DIAGNOSTIC_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
