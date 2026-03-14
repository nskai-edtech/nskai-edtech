"use server";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { users } from "@/drizzle/schema/users";
import { db } from "@/lib/db";

export async function requireTutorUser() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    throw new Error("Unauthorized");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkUserId),
    columns: {
      id: true,
      role: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role !== "TUTOR") {
    throw new Error("Forbidden");
  }

  return user;
}