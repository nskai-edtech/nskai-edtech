/* eslint-disable @typescript-eslint/ban-ts-comment */
"use server";

import { db } from "@/lib/db";
import { users, courses } from "@/drizzle/schema";
import { eq, desc, and, count, sql } from "drizzle-orm";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getTutors() {
  const { sessionClaims } = await auth();

  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    throw new Error("Unauthorized");
  }

  const tutors = await db.query.users.findMany({
    where: eq(users.role, "TUTOR"),
    orderBy: [desc(users.createdAt)],
  });

  return tutors;
}

export async function getAdminPendingCounts() {
  const { sessionClaims } = await auth();

  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    throw new Error("Unauthorized");
  }

  const [pendingCourses] = await db
    .select({ count: count() })
    .from(courses)
    .where(eq(courses.status, "PENDING"));

  const [pendingTutors] = await db
    .select({ count: count() })
    .from(users)
    .where(and(eq(users.role, "TUTOR"), eq(users.status, "PENDING")));

  return {
    pendingCourses: pendingCourses?.count ?? 0,
    pendingTutors: pendingTutors?.count ?? 0,
  };
}

export async function getTutorsWithCourseCount() {
  const { sessionClaims } = await auth();

  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    throw new Error("Unauthorized");
  }

  const tutorsWithCourses = await db
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
      paystackCustomerCode: users.paystackCustomerCode,
      interests: users.interests,
      learningGoal: users.learningGoal,
      createdAt: users.createdAt,
      courseCount: sql<number>`cast(count(case when ${courses.isPublished} = true then 1 end) as integer)`,
    })
    .from(users)
    .leftJoin(courses, eq(users.id, courses.tutorId))
    .where(eq(users.role, "TUTOR"))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt));

  return tutorsWithCourses;
}

export async function getTutorById(tutorId: string) {
  const { sessionClaims } = await auth();

  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    throw new Error("Unauthorized");
  }

  const tutor = await db.query.users.findFirst({
    where: eq(users.id, tutorId),
  });

  return tutor;
}

// Approve a Tutor
export async function approveTutor(tutorId: string) {
  const { sessionClaims } = await auth();

  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    // Get the tutor to find their clerkId
    const tutor = await db.query.users.findFirst({
      where: eq(users.id, tutorId),
    });

    if (!tutor) {
      return { error: "Tutor not found" };
    }

    // Update database status
    await db
      .update(users)
      .set({ status: "ACTIVE" })
      .where(eq(users.id, tutorId));

    // Update Clerk user metadata so session claims reflect the new status
    const client = await clerkClient();
    await client.users.updateUserMetadata(tutor.clerkId, {
      publicMetadata: {
        status: "ACTIVE",
      },
    });

    // Refresh dashboard data
    revalidatePath("/org");
    return { success: true };
  } catch (error) {
    console.error("Approval Error:", error);
    return { error: "Failed to approve" };
  }
}
// Suspend a Tutor
export async function suspendTutor(tutorId: string) {
  const { sessionClaims } = await auth();

  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    const tutor = await db.query.users.findFirst({
      where: eq(users.id, tutorId),
    });

    if (!tutor) {
      return { error: "Tutor not found" };
    }

    await db
      .update(users)
      .set({ status: "SUSPENDED" })
      .where(eq(users.id, tutorId));

    // Sync with Clerk
    const client = await clerkClient();
    await client.users.updateUserMetadata(tutor.clerkId, {
      publicMetadata: { status: "SUSPENDED" },
    });

    revalidatePath("/org");
    return { success: true };
  } catch (error) {
    console.error("Suspend Error:", error);
    return { error: "Failed to suspend" };
  }
}

// Unsuspend (Reactivate) a Tutor
export async function unsuspendTutor(tutorId: string) {
  const { sessionClaims } = await auth();

  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    const tutor = await db.query.users.findFirst({
      where: eq(users.id, tutorId),
    });

    if (!tutor) {
      return { error: "Tutor not found" };
    }

    await db
      .update(users)
      .set({ status: "ACTIVE" })
      .where(eq(users.id, tutorId));

    // Sync with Clerk
    const client = await clerkClient();
    await client.users.updateUserMetadata(tutor.clerkId, {
      publicMetadata: { status: "ACTIVE" },
    });

    revalidatePath("/org");
    return { success: true };
  } catch (error) {
    console.error("Unsuspend Error:", error);
    return { error: "Failed to unsuspend" };
  }
}

// Ban a Tutor
export async function banTutor(tutorId: string) {
  const { sessionClaims } = await auth();

  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    const tutor = await db.query.users.findFirst({
      where: eq(users.id, tutorId),
    });

    if (!tutor) {
      return { error: "Tutor not found" };
    }

    await db
      .update(users)
      .set({ status: "BANNED" })
      .where(eq(users.id, tutorId));

    // Sync with Clerk
    const client = await clerkClient();
    await client.users.updateUserMetadata(tutor.clerkId, {
      publicMetadata: { status: "BANNED" },
    });

    revalidatePath("/org");
    return { success: true };
  } catch (error) {
    console.error("Ban Error:", error);
    return { error: "Failed to ban" };
  }
}

// Unban a Tutor
export async function unbanTutor(tutorId: string) {
  const { sessionClaims } = await auth();

  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    const tutor = await db.query.users.findFirst({
      where: eq(users.id, tutorId),
    });

    if (!tutor) {
      return { error: "Tutor not found" };
    }

    await db
      .update(users)
      .set({ status: "ACTIVE" })
      .where(eq(users.id, tutorId));

    // Sync with Clerk
    const client = await clerkClient();
    await client.users.updateUserMetadata(tutor.clerkId, {
      publicMetadata: { status: "ACTIVE" },
    });

    revalidatePath("/org");
    return { success: true };
  } catch (error) {
    console.error("Unban Error:", error);
    return { error: "Failed to unban" };
  }
}
