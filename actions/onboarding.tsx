"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/email";
import WelcomeEmail from "@/emails/WelcomeEmail";

interface TutorOnboardingData {
  role: "TUTOR";
  firstName: string;
  lastName: string;
  bio: string;
  expertise: string;
}

interface LearnerOnboardingData {
  role: "LEARNER";
  interests?: string[];
  learningGoal?: string;
}

export async function completeOnboarding(
  data: LearnerOnboardingData | TutorOnboardingData,
) {
  const { userId } = await auth();

  if (!userId) {
    return { error: "No Logged In User" };
  }

  const client = await clerkClient();

  try {
    const isTutor = data.role === "TUTOR";

    const status: "PENDING" | "ACTIVE" = isTutor ? "PENDING" : "ACTIVE";

    // prefilled first name and last name fields
    const clerkUser = await client.users.getUser(userId);

    const updatePayload = {
      role: data.role,
      status,
      ...(isTutor && {
        firstName: (data as TutorOnboardingData).firstName,
        lastName: (data as TutorOnboardingData).lastName,
        bio: (data as TutorOnboardingData).bio,
        expertise: (data as TutorOnboardingData).expertise,
      }),
      ...(!isTutor && {
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        interests: (data as LearnerOnboardingData).interests,
        learningGoal: (data as LearnerOnboardingData).learningGoal,
      }),
    };

    const clerkMetadataPayload = {
      role: data.role,
      status,
      ...(!isTutor && {
        interests: (data as LearnerOnboardingData).interests,
        learningGoal: (data as LearnerOnboardingData).learningGoal,
      }),
    };

    const [updatedUsers] = await Promise.all([
      db
        .update(users)
        .set(updatePayload)
        .where(eq(users.clerkId, userId))
        .returning({ email: users.email, firstName: users.firstName }),
      client.users.updateUserMetadata(userId, {
        publicMetadata: clerkMetadataPayload,
      }),
    ]);

    let userEmail = updatedUsers[0]?.email;
    let userName = updatedUsers[0]?.firstName || "User";

    if (updatedUsers.length === 0) {
      console.log("--> Webhook missed user. Failsafe activated.");

      userEmail = clerkUser.emailAddresses[0].emailAddress;
      userName = updatePayload.firstName || clerkUser.firstName || "User";

      await db.insert(users).values({
        clerkId: userId,
        email: userEmail,
        imageUrl: clerkUser.imageUrl,
        ...updatePayload,
      });
    }

    if (userEmail) {
      sendEmail({
        to: userEmail,
        subject: "Welcome to Zerra",
        react: WelcomeEmail({ name: userName, role: data.role }),
      }).catch((err) => console.error("[EMAIL_ERROR]", err));
    }

    return { success: true };
  } catch (err) {
    console.error("[ONBOARDING_ERROR]", err);
    return { error: "Something went wrong" };
  }
}

export async function resetTutorApplication() {
  const { userId } = await auth();

  if (!userId) {
    return { error: "No Logged In User" };
  }

  const client = await clerkClient();

  try {
    const updatePayload = {
      role: "LEARNER" as const,
      status: "ACTIVE" as const,
      expertise: null,
      bio: null,
    };

    const clerkMetadataPayload = {
      role: null,
      status: null,
    };

    await Promise.all([
      db
        .update(users)
        .set(updatePayload)
        .where(eq(users.clerkId, userId)),
      client.users.updateUserMetadata(userId, {
        publicMetadata: clerkMetadataPayload,
      }),
    ]);

    return { success: true };
  } catch (err) {
    console.error("[RESET_TUTOR_APP_ERROR]", err);
    return { error: "Something went wrong while resetting the application" };
  }
}
