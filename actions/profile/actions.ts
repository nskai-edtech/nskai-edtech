"use server";

import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { LearnerProfile, LearnerStats } from "./types";
import { fetchLearnerAggregateStats } from "./queries";

export async function getLearnerProfile(): Promise<
  { error: string } | LearnerProfile
> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { error: "Unauthorized" };

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });

    if (!user) return { error: "User not found" };

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      bio: user.bio,
      expertise: user.expertise,
      interests: user.interests,
      imageUrl: user.imageUrl,
      createdAt: user.createdAt,
    };
  } catch (error) {
    console.error("Failed to get user's profile", error);
    return { error: "Failed to get profile" };
  }
}

export async function updateLearnerProfile(
  data: Partial<LearnerProfile>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { success: false, error: "Unauthorized" };

    const updateData = {
      ...(data.firstName && { firstName: data.firstName }),
      ...(data.lastName && { lastName: data.lastName }),
      ...(data.imageUrl && { imageUrl: data.imageUrl }),
      ...(data.bio && { bio: data.bio }),
      ...(data.expertise && { expertise: data.expertise }),
      ...(data.interests && { interests: data.interests }),
    };

    if (updateData.bio && updateData.bio.length > 500) {
      return { success: false, error: "Bio too long" };
    }
    await db.update(users).set(updateData).where(eq(users.clerkId, clerkId));

    revalidatePath("/learner");
    revalidatePath("/learner/profile");
    return { success: true };
  } catch (error) {
    console.error("[UPDATE_PROFILE_ERROR]", error);
    return { success: false, error: "Update failed" };
  }
}

export async function getLearnerStats(): Promise<
  { error: string } | LearnerStats
> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { error: "Unauthorized" };

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });

    if (!user) return { error: "User not found" };

    const { courseStats, lastActivityDate } = await fetchLearnerAggregateStats(
      user.id,
    );

    let totalCoursesCompleted = 0;
    let totalLessonsAvailable = 0;
    let totalLessonsCompleted = 0;

    courseStats.forEach((course) => {
      totalLessonsAvailable += course.totalLessons;
      totalLessonsCompleted += course.completedLessons;

      if (
        course.totalLessons > 0 &&
        course.totalLessons === course.completedLessons
      ) {
        totalCoursesCompleted++;
      }
    });

    return {
      totalCoursesEnrolled: courseStats.length,
      totalCoursesCompleted,
      totalLessonsCompleted,
      completionRate:
        totalLessonsAvailable > 0
          ? Math.round((totalLessonsCompleted / totalLessonsAvailable) * 100)
          : 0,
      memberSince: user.createdAt,
      lastActivityDate,
      points: user.points ?? 0,
      currentStreak: user.currentStreak ?? 0,
      longestStreak: user.longestStreak ?? 0,
    };
  } catch (error) {
    console.error("[STATS_ERROR]", error);
    return { error: "Failed to load stats" };
  }
}

export async function deleteAccount(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { success: false, error: "Unauthorized" };

    // Delete user from database (FK cascades handle related data)
    await db.delete(users).where(eq(users.clerkId, clerkId));

    // Delete user from Clerk
    const clerk = await clerkClient();
    await clerk.users.deleteUser(clerkId);

    return { success: true };
  } catch (error) {
    console.error("[DELETE_ACCOUNT_ERROR]", error);
    return { success: false, error: "Failed to delete account" };
  }
}
