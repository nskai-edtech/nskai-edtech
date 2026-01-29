/* eslint-disable @typescript-eslint/ban-ts-comment */
"use server";

import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
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
    await db
      .update(users)
      .set({ status: "ACTIVE" })
      .where(eq(users.id, tutorId));

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
    await db
      .update(users)
      .set({ status: "SUSPENDED" })
      .where(eq(users.id, tutorId));

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
    await db
      .update(users)
      .set({ status: "ACTIVE" })
      .where(eq(users.id, tutorId));

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
    await db
      .update(users)
      .set({ status: "BANNED" })
      .where(eq(users.id, tutorId));

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
    await db
      .update(users)
      .set({ status: "ACTIVE" })
      .where(eq(users.id, tutorId));

    revalidatePath("/org");
    return { success: true };
  } catch (error) {
    console.error("Unban Error:", error);
    return { error: "Failed to unban" };
  }
}
