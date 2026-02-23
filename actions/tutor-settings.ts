"use server";

import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

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

export async function getTutorProfile(): Promise<
  { error: string } | TutorProfile
> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return { error: "Unauthorized" };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
      columns: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        expertise: true,
        imageUrl: true,
        paystackCustomerCode: true,
        createdAt: true,
        role: true,
      },
    });

    if (!user || user.role !== "TUTOR") {
      return { error: "Tutor profile not found" };
    }

    const { ...profileData } = user;
    return profileData;
  } catch (error) {
    console.error("[GET_TUTOR_PROFILE]", error);
    return { error: "Failed to fetch profile" };
  }
}

export async function updateTutorProfile(
  data: UpdateTutorProfileData,
): Promise<{ error?: string; success?: boolean }> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return { error: "Unauthorized" };
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
      columns: { id: true, role: true },
    });

    if (!user || user.role !== "TUTOR") {
      return { error: "Tutor profile not found" };
    }

    const updateData = {
      ...(data.firstName !== undefined && { firstName: data.firstName }),
      ...(data.lastName !== undefined && { lastName: data.lastName }),
      ...(data.bio !== undefined && { bio: data.bio }),
      ...(data.expertise !== undefined && { expertise: data.expertise }),
    };

    if (Object.keys(updateData).length > 0) {
      await db.update(users).set(updateData).where(eq(users.id, user.id));
    }

    revalidatePath("/tutor/settings");
    return { success: true };
  } catch (error) {
    console.error("[UPDATE_TUTOR_PROFILE]", error);
    return { error: "Failed to update profile" };
  }
}
