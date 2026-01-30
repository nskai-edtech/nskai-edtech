/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import WelcomeEmail from "@/emails/WelcomeEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    console.log("--> Error: No User ID found in session.");
    return { error: "No Logged In User" };
  }

  const client = await clerkClient();

  try {
    console.log(`--> Starting Onboarding for User: ${userId}`);
    console.log(`--> Role Selected: ${data.role}`);

    const isTutor = data.role === "TUTOR";
    const status = isTutor ? "PENDING" : "ACTIVE";

    // 1. Prepare Data
    const updateData: any = {
      role: data.role,
      status: status,
    };

    if (isTutor) {
      const tutorData = data as TutorOnboardingData;
      updateData.firstName = tutorData.firstName;
      updateData.lastName = tutorData.lastName;
      updateData.bio = tutorData.bio;
      updateData.expertise = tutorData.expertise;
    } else {
      const learnerData = data as LearnerOnboardingData;
      if (learnerData.interests) {
        updateData.interests = learnerData.interests;
      }
      if (learnerData.learningGoal) {
        updateData.learningGoal = learnerData.learningGoal;
      }
    }

    let updatedUsers = await db
      .update(users)
      .set(updateData)
      .where(eq(users.clerkId, userId))
      .returning({
        email: users.email,
        firstName: users.firstName,
      });

    // FAILSAFE: If User not in DB (Webhook failed), Insert them now
    if (updatedUsers.length === 0) {
      console.log(
        "--> User not found in DB update. Attempting Manual Insert...",
      );

      const clerkUser = await client.users.getUser(userId);
      const email = clerkUser.emailAddresses[0].emailAddress;
      const image = clerkUser.imageUrl;

      updatedUsers = await db
        .insert(users)
        .values({
          clerkId: userId,
          email: email,
          imageUrl: image,
          ...updateData,
        })
        .returning({
          email: users.email,
          firstName: users.firstName,
        });

      console.log("--> Manual Insert Success.");
    } else {
      console.log("--> DB Update Success.");
    }

    const userEmail = updatedUsers[0]?.email;
    const userName = updatedUsers[0]?.firstName || "User";

    // Update Clerk Metadata
    const publicMetadata: any = {
      role: data.role,
      status: status,
    };

    if (data.role === "LEARNER") {
      if (data.interests) {
        publicMetadata.interests = data.interests;
      }
      if (data.learningGoal) {
        publicMetadata.learningGoal = data.learningGoal;
      }
    }

    await client.users.updateUserMetadata(userId, {
      publicMetadata,
    });
    console.log("--> Clerk Metadata Synced.");

    // Send Welcome Email (WITH LOGS)
    if (userEmail) {
      console.log(`--> Attempting to send email to: ${userEmail}`);

      const { data, error } = await resend.emails.send({
        from: "NSKAI <onboarding@resend.dev>",

        // 2. TO: normally 'userEmail'.
        // IMPORTANT: In test mode, this ONLY works if 'userEmail' is 'nsukka.ai@gmail.com'.
        to: "nsukka.ai@gmail.com",

        subject: "Welcome to NSKAI",
        react: <WelcomeEmail name={userName} />,
      });

      if (error) {
        console.error("--> RESEND ERROR:", error);
      } else {
        console.log("--> EMAIL SENT SUCCESSFULLY ✅ ID:", data?.id);
      }
    } else {
      console.log("--> SKIPPED EMAIL: No email address found in DB record.");
    }

    // Return Success
    return { success: true };
  } catch (err) {
    console.error("--> FATAL ONBOARDING ERROR:", err);
    return { error: "Something went wrong" };
  }
}
