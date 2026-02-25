/* eslint-disable @typescript-eslint/ban-ts-comment */
"use server";

import { db } from "@/lib/db";
import {
  assignments,
  assignmentSubmissions,
  users,
  lessons,
} from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function upsertAssignment(
  lessonId: string,
  data: {
    title: string;
    description?: string;
    maxScore?: number;
  },
) {
  const { userId, sessionClaims } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  if (!user) return { error: "User not found" };

  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: { chapter: { with: { course: true } } },
  });
  if (!lesson) return { error: "Lesson not found" };

  const course = lesson.chapter?.course;
  if (!course) return { error: "Course not found for lesson" };

  // @ts-ignore
  const role = sessionClaims?.metadata?.role;
  if (course.tutorId !== user.id && role !== "ORG_ADMIN") {
    return { error: "Not authorized" };
  }

  try {
    const existingAssignment = await db.query.assignments.findFirst({
      where: eq(assignments.lessonId, lessonId),
    });

    if (existingAssignment) {
      const [updated] = await db
        .update(assignments)
        .set({
          title: data.title,
          description: data.description,
          maxScore: data.maxScore ?? 100,
          updatedAt: new Date(),
        })
        .where(eq(assignments.id, existingAssignment.id))
        .returning();

      revalidatePath(`/tutor/courses/${course.id}`);
      return { success: true, assignment: updated };
    } else {
      const [created] = await db
        .insert(assignments)
        .values({
          courseId: course.id,
          lessonId,
          title: data.title,
          description: data.description,
          maxScore: data.maxScore ?? 100,
        })
        .returning();

      revalidatePath(`/tutor/courses/${course.id}`);
      return { success: true, assignment: created };
    }
  } catch (error) {
    console.error("Failed to upsert assignment:", error);
    return { error: "Failed to save assignment" };
  }
}

export async function submitAssignment(assignmentId: string, fileUrl: string) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  if (!user) return { error: "User not found" };

  try {
    const existingSubmission = await db.query.assignmentSubmissions.findFirst({
      where: and(
        eq(assignmentSubmissions.assignmentId, assignmentId),
        eq(assignmentSubmissions.userId, user.id),
      ),
      with: { assignment: true },
    });

    const isPassing =
      existingSubmission?.status === "GRADED" &&
      (existingSubmission.score ?? 0) >=
        (existingSubmission.assignment?.maxScore ?? 100) * 0.7;

    if (existingSubmission && existingSubmission.status === "PENDING") {
      return {
        error: "You already have an active submission waiting for review.",
      };
    }

    if (existingSubmission && isPassing) {
      return { error: "You have already passed this assessment." };
    }

    if (existingSubmission) {
      // update existing record
      const [updated] = await db
        .update(assignmentSubmissions)
        .set({
          fileUrl,
          status: "PENDING",
          submittedAt: new Date(),
        })
        .where(eq(assignmentSubmissions.id, existingSubmission.id))
        .returning();

      revalidatePath(`/`);
      return { success: true, submission: updated };
    } else {
      // create new
      const [created] = await db
        .insert(assignmentSubmissions)
        .values({
          assignmentId,
          userId: user.id,
          fileUrl,
          status: "PENDING",
        })
        .returning();

      revalidatePath(`/`);
      return { success: true, submission: created };
    }
  } catch (error) {
    console.error("Failed to submit assignment:", error);
    return { error: "Failed to submit assignment" };
  }
}

export async function gradeSubmission(
  submissionId: string,
  score: number,
  feedback: string,
) {
  const { userId, sessionClaims } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  if (!user) return { error: "User not found" };

  const submission = await db.query.assignmentSubmissions.findFirst({
    where: eq(assignmentSubmissions.id, submissionId),
    with: { assignment: { with: { course: true } } },
  });
  if (!submission) return { error: "Submission not found" };

  const course = submission.assignment?.course;
  if (!course) return { error: "Course not found" };

  // @ts-ignore
  const role = sessionClaims?.metadata?.role;
  if (course.tutorId !== user.id && role !== "ORG_ADMIN") {
    return { error: "Not authorized" };
  }

  try {
    const [updated] = await db
      .update(assignmentSubmissions)
      .set({
        status: "GRADED",
        score,
        feedback,
        gradedAt: new Date(),
      })
      .where(eq(assignmentSubmissions.id, submissionId))
      .returning();

    revalidatePath(`/tutor/courses/${course.id}`);
    revalidatePath(`/`);
    return { success: true, submission: updated };
  } catch (error) {
    console.error("Failed to grade submission:", error);
    return { error: "Failed to grade submission" };
  }
}
