"use server";

import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";
import type { UserSkillProfile, SkillGap } from "./types";

// ─── Helper: get DB user from Clerk ───
async function getAuthUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
    columns: { id: true, interests: true, diagnosticCompletedAt: true },
  });
  return user;
}

// ─── Get User Skill Profile ───
// Returns all skills the user has been assessed on, grouped by category.
export async function getUserSkillProfile(): Promise<
  | { error: string }
  | { skills: UserSkillProfile[]; diagnosticCompletedAt: Date | null }
> {
  const user = await getAuthUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const rows = await db.execute(sql`
      SELECT
        us.id,
        us.skill_id AS "skillId",
        s.title AS "skillTitle",
        s.category AS "skillCategory",
        us.mastery_score AS "masteryScore",
        us.last_assessed_at AS "lastAssessedAt"
      FROM user_skill us
      JOIN skill s ON s.id = us.skill_id
      WHERE us.user_id = ${user.id}
      ORDER BY s.category, s.title
    `);

    const result: UserSkillProfile[] = (rows.rows ?? rows).map(
      (r: Record<string, unknown>) => ({
        id: r.id as string,
        skillId: r.skillId as string,
        skillTitle: r.skillTitle as string,
        skillCategory: r.skillCategory as string,
        masteryScore: Number(r.masteryScore),
        lastAssessedAt: r.lastAssessedAt
          ? new Date(r.lastAssessedAt as string)
          : null,
      }),
    );

    return {
      skills: result,
      diagnosticCompletedAt: user.diagnosticCompletedAt,
    };
  } catch (error) {
    console.error("[GET_USER_SKILL_PROFILE]", error);
    return { error: "Failed to load skill profile" };
  }
}

// ─── Get Skill Gaps ───
// Returns skills where mastery < 50 or no record, with recommended courses.
export async function getSkillGaps(): Promise<
  { error: string } | { gaps: SkillGap[] }
> {
  const user = await getAuthUser();
  if (!user) return { error: "Unauthorized" };

  try {
    // Get weak skills (mastery < 50) and unassessed skills in user's interest categories
    const rows = await db.execute(sql`
      SELECT
        s.id AS "skillId",
        s.title AS "skillTitle",
        s.category AS "skillCategory",
        COALESCE(us.mastery_score, 0)::int AS "masteryScore"
      FROM skill s
      LEFT JOIN user_skill us ON us.skill_id = s.id AND us.user_id = ${user.id}
      WHERE (us.mastery_score IS NULL OR us.mastery_score < 50)
        AND EXISTS (SELECT 1 FROM assessment WHERE skill_id = s.id)
      ORDER BY COALESCE(us.mastery_score, 0) ASC
      LIMIT 10
    `);

    const gaps: SkillGap[] = [];

    for (const row of (rows.rows ?? rows) as Record<string, unknown>[]) {
      const skillId = row.skillId as string;

      // Find courses that teach this skill
      const courseRows = await db.execute(sql`
        SELECT c.id AS "courseId", c.title AS "courseTitle", c.image_url AS "courseImageUrl"
        FROM course_skill cs
        JOIN course c ON c.id = cs.course_id
        WHERE cs.skill_id = ${skillId}
          AND c.status = 'PUBLISHED'
          AND NOT EXISTS (
            SELECT 1 FROM purchase p
            WHERE p.course_id = c.id AND p.user_id = ${user.id}
          )
        LIMIT 3
      `);

      gaps.push({
        skillId,
        skillTitle: row.skillTitle as string,
        skillCategory: row.skillCategory as string,
        masteryScore: row.masteryScore as number,
        courses: (courseRows.rows ?? courseRows).map(
          (c: Record<string, unknown>) => ({
            courseId: c.courseId as string,
            courseTitle: c.courseTitle as string,
            courseImageUrl: c.courseImageUrl as string | null,
          }),
        ),
      });
    }

    return { gaps };
  } catch (error) {
    console.error("[GET_SKILL_GAPS]", error);
    return { error: "Failed to load skill gaps" };
  }
}

// ─── Get Available Skill Categories ───
// Returns categories that have at least 1 assessment question.
export async function getAvailableSkillCategories(): Promise<
  { error: string } | { categories: string[] }
> {
  try {
    const rows = await db.execute(sql`
      SELECT DISTINCT s.category
      FROM skill s
      WHERE EXISTS (SELECT 1 FROM assessment WHERE skill_id = s.id)
      ORDER BY s.category
    `);

    const categories = (rows.rows ?? rows).map(
      (r: Record<string, unknown>) => r.category as string,
    );

    return { categories };
  } catch (error) {
    console.error("[GET_SKILL_CATEGORIES]", error);
    return { error: "Failed to load categories" };
  }
}

// ─── Get Skills by Category ───
export async function getSkillsByCategory(
  category: string,
): Promise<
  { error: string } | { skills: { id: string; title: string; questionCount: number }[] }
> {
  try {
    const rows = await db.execute(sql`
      SELECT s.id, s.title,
             COUNT(a.id)::int AS "questionCount"
      FROM skill s
      LEFT JOIN assessment a ON a.skill_id = s.id
      WHERE s.category = ${category}
      GROUP BY s.id, s.title
      HAVING COUNT(a.id) > 0
      ORDER BY s.title
    `);

    const result = (rows.rows ?? rows).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      title: r.title as string,
      questionCount: r.questionCount as number,
    }));

    return { skills: result };
  } catch (error) {
    console.error("[GET_SKILLS_BY_CATEGORY]", error);
    return { error: "Failed to load skills" };
  }
}
