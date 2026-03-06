"use server";

import { db } from "@/lib/db";
import { users, courses, purchases } from "@/drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";
import TutorApprovedEmail from "@/emails/TutorApprovedEmail";
import TutorRejectedEmail from "@/emails/TutorRejectedEmail";
import { checkAdmin } from "./auth";

export async function getTutors() {
  await checkAdmin();
  return await db.query.users.findMany({
    where: eq(users.role, "TUTOR"),
    orderBy: [desc(users.createdAt)],
  });
}

export async function getTutorsWithCourseCount() {
  await checkAdmin();

  return await db
    .select({
      id: users.id,
      clerkId: users.clerkId,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      bio: users.bio,
      expertise: users.expertise,
      role: users.role,
      status: users.status,
      imageUrl: users.imageUrl,
      createdAt: users.createdAt,
      courseCount: sql<number>`cast(count(case when ${courses.status} = 'PUBLISHED' then 1 end) as integer)`,
    })
    .from(users)
    .leftJoin(courses, eq(users.id, courses.tutorId))
    .where(eq(users.role, "TUTOR"))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt));
}

export async function getTutorById(tutorId: string) {
  await checkAdmin();

  const tutor = await db.query.users.findFirst({
    where: eq(users.id, tutorId),
  });

  if (!tutor) return null;

  const [stats] = await db
    .select({
      totalCourses: sql<number>`cast(count(distinct ${courses.id}) as integer)`,
      totalStudents: sql<number>`cast(count(distinct ${purchases.userId}) as integer)`,
    })
    .from(courses)
    .leftJoin(purchases, eq(courses.id, purchases.courseId))
    .where(eq(courses.tutorId, tutorId));

  return {
    ...tutor,
    totalCourses: stats?.totalCourses ?? 0,
    totalStudents: stats?.totalStudents ?? 0,
  };
}

export async function getTutorCoursesForAdmin(tutorId: string) {
  await checkAdmin();

  return await db
    .select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
      imageUrl: courses.imageUrl,
      status: courses.status,
      price: courses.price,
      createdAt: courses.createdAt,
      studentsEnrolled: sql<number>`cast(count(distinct ${purchases.id}) as integer)`,
    })
    .from(courses)
    .leftJoin(purchases, eq(courses.id, purchases.courseId))
    .where(eq(courses.tutorId, tutorId))
    .groupBy(courses.id)
    .orderBy(desc(courses.createdAt));
}

// --- STATUS MUTATIONS ---

async function updateTutorStatus(
  tutorId: string,
  status: "ACTIVE" | "SUSPENDED" | "BANNED" | "REJECTED",
) {
  await checkAdmin();

  const tutor = await db.query.users.findFirst({
    where: eq(users.id, tutorId),
  });
  if (!tutor) return { error: "Tutor not found" };

  await db.update(users).set({ status }).where(eq(users.id, tutorId));

  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(tutor.clerkId, {
      publicMetadata: { status },
    });
  } catch (error) {
    console.warn("Clerk Sync Failed:", error);
  }

  revalidatePath("/org");
  return { success: true, tutor };
}

export async function approveTutor(tutorId: string) {
  const result = await updateTutorStatus(tutorId, "ACTIVE");

  if (result.success && result.tutor) {
    sendEmail({
      to: result.tutor.email,
      subject: "Your NSKAI tutor application is approved!",
      react: TutorApprovedEmail({ name: result.tutor.firstName || "Tutor" }),
    }).catch(() => {});
  }
  return result;
}

export async function rejectTutor(tutorId: string) {
  const result = await updateTutorStatus(tutorId, "REJECTED");

  if (result.success && result.tutor) {
    sendEmail({
      to: result.tutor.email,
      subject: "Update on your NSKAI tutor application",
      react: TutorRejectedEmail({ 
        name: result.tutor.firstName || "Tutor", 
        expertise: result.tutor.expertise || undefined 
      }),
    }).catch(() => {});
  }
  return result;
}

export async function suspendTutor(tutorId: string) {
  return updateTutorStatus(tutorId, "SUSPENDED");
}
export async function unsuspendTutor(tutorId: string) {
  return updateTutorStatus(tutorId, "ACTIVE");
}
export async function banTutor(tutorId: string) {
  return updateTutorStatus(tutorId, "BANNED");
}
export async function unbanTutor(tutorId: string) {
  return updateTutorStatus(tutorId, "ACTIVE");
}
