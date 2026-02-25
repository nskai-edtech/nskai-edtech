"use server";

import { db } from "@/lib/db";
import {
  assignments,
  assignmentSubmissions,
  users,
  courses,
} from "@/drizzle/schema";
import { eq, desc, and, count } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function getTutorSubmissions() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const tutor = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  if (!tutor) throw new Error("User not found");

  const data = await db
    .select({
      id: assignmentSubmissions.id,
      status: assignmentSubmissions.status,
      score: assignmentSubmissions.score,
      feedback: assignmentSubmissions.feedback,
      fileUrl: assignmentSubmissions.fileUrl,
      submittedAt: assignmentSubmissions.submittedAt,
      gradedAt: assignmentSubmissions.gradedAt,
      assignment: {
        id: assignments.id,
        title: assignments.title,
        maxScore: assignments.maxScore,
      },
      course: {
        id: courses.id,
        title: courses.title,
      },
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        imageUrl: users.imageUrl,
      },
    })
    .from(assignmentSubmissions)
    .innerJoin(
      assignments,
      eq(assignmentSubmissions.assignmentId, assignments.id),
    )
    .innerJoin(courses, eq(assignments.courseId, courses.id))
    .innerJoin(users, eq(assignmentSubmissions.userId, users.id))
    .where(eq(courses.tutorId, tutor.id))
    .orderBy(desc(assignmentSubmissions.submittedAt));

  return data;
}

export async function getPendingSubmissionsCount() {
  const { userId } = await auth();
  if (!userId) return 0;

  const tutor = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  if (!tutor) return 0;

  const [{ value }] = await db
    .select({ value: count() })
    .from(assignmentSubmissions)
    .innerJoin(
      assignments,
      eq(assignmentSubmissions.assignmentId, assignments.id),
    )
    .innerJoin(courses, eq(assignments.courseId, courses.id))
    .where(
      and(
        eq(courses.tutorId, tutor.id),
        eq(assignmentSubmissions.status, "PENDING"),
      ),
    );

  return value;
}
