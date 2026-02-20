"use server";

import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TutorProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  expertise: string | null;
  imageUrl: string | null;
  paystackCustomerCode: string | null;
  createdAt: Date;
}

export interface UpdateTutorProfileData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  expertise?: string;
}

// ─── Actions ────────────────────────────────────────────────────────────────

export async function getTutorProfile(): Promise<
  { error: string } | TutorProfile
> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user || user.role !== "TUTOR") {
      return { error: "Tutor profile not found" };
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      expertise: user.expertise,
      imageUrl: user.imageUrl,
      paystackCustomerCode: user.paystackCustomerCode,
      createdAt: user.createdAt,
    };
  } catch (error) {
    console.error("[GET_TUTOR_PROFILE]", error);
    return { error: "Failed to fetch profile" };
  }
}

export async function updateTutorProfile(
  data: UpdateTutorProfileData,
): Promise<{ error?: string; success?: boolean }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: "Unauthorized" };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user || user.role !== "TUTOR") {
      return { error: "Tutor profile not found" };
    }

    await db
      .update(users)
      .set({
        firstName: data.firstName ?? user.firstName,
        lastName: data.lastName ?? user.lastName,
        bio: data.bio ?? user.bio,
        expertise: data.expertise ?? user.expertise,
      })
      .where(eq(users.id, user.id));

    revalidatePath("/tutor/settings");
    return { success: true };
  } catch (error) {
    console.error("[UPDATE_TUTOR_PROFILE]", error);
    return { error: "Failed to update profile" };
  }
}
