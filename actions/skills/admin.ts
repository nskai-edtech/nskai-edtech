"use server";

import { db } from "@/lib/db";
import {
  skills,
  skillDependencies,
  assessments,
} from "@/drizzle/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { SkillWithCounts, SkillDetail } from "./types";

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

// ─── Create Skill ───
export async function createSkill(data: {
  title: string;
  category: string;
  description?: string;
}) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { error: "Unauthorized" };

  try {
    const [skill] = await db
      .insert(skills)
      .values({
        title: data.title,
        category: data.category,
        description: data.description || null,
      })
      .returning();

    revalidatePath("/org/skills");
    return { success: true, skill };
  } catch (error) {
    console.error("[CREATE_SKILL]", error);
    return { error: "Failed to create skill" };
  }
}

// ─── Update Skill ───
export async function updateSkill(
  skillId: string,
  data: { title?: string; category?: string; description?: string },
) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { error: "Unauthorized" };

  try {
    const [updated] = await db
      .update(skills)
      .set(data)
      .where(eq(skills.id, skillId))
      .returning();

    if (!updated) return { error: "Skill not found" };

    revalidatePath("/org/skills");
    revalidatePath(`/org/skills/${skillId}`);
    return { success: true, skill: updated };
  } catch (error) {
    console.error("[UPDATE_SKILL]", error);
    return { error: "Failed to update skill" };
  }
}

// ─── Delete Skill ───
export async function deleteSkill(skillId: string) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { error: "Unauthorized" };

  try {
    await db.delete(skills).where(eq(skills.id, skillId));
    revalidatePath("/org/skills");
    return { success: true };
  } catch (error) {
    console.error("[DELETE_SKILL]", error);
    return { error: "Failed to delete skill" };
  }
}

// ─── Add Skill Dependency ───
export async function addSkillDependency(
  skillId: string,
  prerequisiteSkillId: string,
) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { error: "Unauthorized" };

  if (skillId === prerequisiteSkillId) {
    return { error: "A skill cannot be its own prerequisite" };
  }

  try {
    await db
      .insert(skillDependencies)
      .values({ skillId, prerequisiteSkillId })
      .onConflictDoNothing();

    revalidatePath(`/org/skills/${skillId}`);
    return { success: true };
  } catch (error) {
    console.error("[ADD_SKILL_DEP]", error);
    return { error: "Failed to add dependency" };
  }
}

// ─── Remove Skill Dependency ───
export async function removeSkillDependency(dependencyId: string) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { error: "Unauthorized" };

  try {
    await db
      .delete(skillDependencies)
      .where(eq(skillDependencies.id, dependencyId));

    revalidatePath("/org/skills");
    return { success: true };
  } catch (error) {
    console.error("[REMOVE_SKILL_DEP]", error);
    return { error: "Failed to remove dependency" };
  }
}

// ─── Get All Skills (with counts) ───
export async function getAllSkills(): Promise<
  { error: string } | { skills: SkillWithCounts[] }
> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { error: "Unauthorized" };

  try {
    const rows = await db.execute(sql`
      SELECT
        s.id,
        s.title,
        s.category,
        s.description,
        s.created_at AS "createdAt",
        COALESCE(aq.cnt, 0)::int AS "questionCount",
        COALESCE(us.cnt, 0)::int AS "userCount"
      FROM skill s
      LEFT JOIN (
        SELECT skill_id, COUNT(*)::int AS cnt
        FROM assessment
        GROUP BY skill_id
      ) aq ON aq.skill_id = s.id
      LEFT JOIN (
        SELECT skill_id, COUNT(*)::int AS cnt
        FROM user_skill
        GROUP BY skill_id
      ) us ON us.skill_id = s.id
      ORDER BY s.category, s.title
    `);

    const result = (rows.rows ?? rows).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      title: row.title as string,
      category: row.category as string,
      description: row.description as string | null,
      createdAt: new Date(row.createdAt as string),
      questionCount: row.questionCount as number,
      userCount: row.userCount as number,
    }));

    return { skills: result };
  } catch (error) {
    console.error("[GET_ALL_SKILLS]", error);
    return { error: "Failed to load skills" };
  }
}

// ─── Get Skill Details ───
export async function getSkillDetails(
  skillId: string,
): Promise<{ error: string } | { skill: SkillDetail }> {
  const isAdmin = await requireAdmin();
  if (!isAdmin) return { error: "Unauthorized" };

  try {
    const skill = await db.query.skills.findFirst({
      where: eq(skills.id, skillId),
    });

    if (!skill) return { error: "Skill not found" };

    // Get prerequisites (skills this skill depends on)
    const prereqRows = await db.execute(sql`
      SELECT sd.id, sd.prerequisite_skill_id AS "prerequisiteSkillId",
             s.title, s.category
      FROM skill_dependency sd
      JOIN skill s ON s.id = sd.prerequisite_skill_id
      WHERE sd.skill_id = ${skillId}
      ORDER BY s.title
    `);

    // Get dependents (skills that depend on this one)
    const depRows = await db.execute(sql`
      SELECT sd.id, sd.skill_id AS "skillId",
             s.title, s.category
      FROM skill_dependency sd
      JOIN skill s ON s.id = sd.skill_id
      WHERE sd.prerequisite_skill_id = ${skillId}
      ORDER BY s.title
    `);

    // Get question count
    const [qCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(assessments)
      .where(eq(assessments.skillId, skillId));

    const prerequisites = (prereqRows.rows ?? prereqRows).map(
      (r: Record<string, unknown>) => ({
        id: r.id as string,
        prerequisiteSkillId: r.prerequisiteSkillId as string,
        title: r.title as string,
        category: r.category as string,
      }),
    );

    const dependents = (depRows.rows ?? depRows).map(
      (r: Record<string, unknown>) => ({
        id: r.id as string,
        skillId: r.skillId as string,
        title: r.title as string,
        category: r.category as string,
      }),
    );

    return {
      skill: {
        ...skill,
        prerequisites,
        dependents,
        questionCount: qCount?.count ?? 0,
      },
    };
  } catch (error) {
    console.error("[GET_SKILL_DETAILS]", error);
    return { error: "Failed to load skill details" };
  }
}

// ─── Get Skills List (for selectors, no admin check) ───
export async function getSkillsList(): Promise<
  | { error: string }
  | { skills: { id: string; title: string; category: string }[] }
> {
  try {
    const rows = await db
      .select({
        id: skills.id,
        title: skills.title,
        category: skills.category,
      })
      .from(skills)
      .orderBy(skills.category, skills.title);

    return { skills: rows };
  } catch (error) {
    console.error("[GET_SKILLS_LIST]", error);
    return { error: "Failed to load skills" };
  }
}
