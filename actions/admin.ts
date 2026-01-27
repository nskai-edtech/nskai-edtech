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
