"use server";

import { db } from "@/lib/db";
import { courseSkills, courses, users } from "@/drizzle/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function verifyCourseOwner(courseId: string) {
  const { userId: clerkId, sessionClaims } = await auth();
  if (!clerkId) return null;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const role = sessionClaims?.metadata?.role;

  if (role === "ORG_ADMIN") return true;

  // Tutors can only edit their own courses
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
    columns: { id: true },
  });
  if (!user) return null;

  const course = await db.query.courses.findFirst({
    where: and(eq(courses.id, courseId), eq(courses.tutorId, user.id)),
    columns: { id: true },
  });

  return course ? true : null;
}

const MAX_COURSE_SKILLS = 5;

// ─── Add Skill to Course ───
export async function addSkillToCourse(courseId: string, skillId: string) {
  const canEdit = await verifyCourseOwner(courseId);
  if (!canEdit) return { error: "Unauthorized" };

  try {
    // Enforce max linked skills limit
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(courseSkills)
      .where(eq(courseSkills.courseId, courseId));

    if ((countResult?.count ?? 0) >= MAX_COURSE_SKILLS) {
      return {
        error: `Maximum of ${MAX_COURSE_SKILLS} linked skills per course`,
      };
    }

    await db
      .insert(courseSkills)
      .values({ courseId, skillId })
      .onConflictDoNothing();

    revalidatePath(`/tutor/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error("[ADD_SKILL_TO_COURSE]", error);
    return { error: "Failed to add skill to course" };
  }
}

export async function removeSkillFromCourse(courseId: string, skillId: string) {
  const canEdit = await verifyCourseOwner(courseId);
  if (!canEdit) return { error: "Unauthorized" };

  try {
    await db
      .delete(courseSkills)
      .where(
        and(
          eq(courseSkills.courseId, courseId),
          eq(courseSkills.skillId, skillId),
        ),
      );

    revalidatePath(`/tutor/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error("[REMOVE_SKILL_FROM_COURSE]", error);
    return { error: "Failed to remove skill from course" };
  }
}

export async function getCourseSkills(
  courseId: string,
): Promise<
  | { error: string }
  | { skills: { id: string; title: string; category: string }[] }
> {
  try {
    const rows = await db.execute(sql`
      SELECT s.id, s.title, s.category
      FROM course_skill cs
      JOIN skill s ON s.id = cs.skill_id
      WHERE cs.course_id = ${courseId}
      ORDER BY s.category, s.title
    `);

    const result = (rows.rows ?? rows).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      title: r.title as string,
      category: r.category as string,
    }));

    return { skills: result };
  } catch (error) {
    console.error("[GET_COURSE_SKILLS]", error);
    return { error: "Failed to load course skills" };
  }
}

export async function getCoursesForSkill(skillId: string): Promise<
  | { error: string }
  | {
      courses: {
        id: string;
        title: string;
        imageUrl: string | null;
        price: number | null;
      }[];
    }
> {
  try {
    const rows = await db.execute(sql`
      SELECT c.id, c.title, c.image_url AS "imageUrl", c.price
      FROM course_skill cs
      JOIN course c ON c.id = cs.course_id
      WHERE cs.skill_id = ${skillId}
        AND c.status = 'PUBLISHED'
      ORDER BY c.title
    `);

    const result = (rows.rows ?? rows).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      title: r.title as string,
      imageUrl: r.imageUrl as string | null,
      price: r.price as number | null,
    }));

    return { courses: result };
  } catch (error) {
    console.error("[GET_COURSES_FOR_SKILL]", error);
    return { error: "Failed to load courses" };
  }
}
