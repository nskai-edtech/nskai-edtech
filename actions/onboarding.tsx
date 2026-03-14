"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import {
  users,
  schools,
  schoolLocations,
  schoolFinancials,
  students,
} from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { OnboardingFormData } from "@/lib/validations/onboarding";
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
      db.update(users).set(updatePayload).where(eq(users.clerkId, userId)),
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

export async function completeSchoolOnboarding(data: OnboardingFormData) {
  const { userId } = await auth();

  if (!userId) {
    return { error: "No Logged In User" };
  }

  const client = await clerkClient();

  try {
    // 1. Insert into schools database
    const [newSchool] = await db.insert(schools).values({
      name: data.name,
      motto: data.motto || null,
      yearEstablished: data.yearEstablished || null,
      schoolType: data.schoolType,
      educationLevels: data.educationLevels,
      logoUrl: data.logoUrl || null,
      primaryColor: data.primaryColor || null,
      curriculumType: data.curriculumType,
      ownerName: data.ownerName,
      ownerEmail: data.ownerEmail,
      proprietorName: data.proprietorName,
      proprietorEmail: data.proprietorEmail,
    }).returning({ id: schools.id });

    const orgId = newSchool.id;

    // 3. Insert specific physical address details
    await db.insert(schoolLocations).values({
      schoolId: orgId,
      email: data.email,
      receptionPhone: data.receptionPhone,
      fullAddress: data.fullAddress,
      country: data.country,
      state: data.state,
      lga: data.lga,
      website: data.website || null,
    });

    // 4. Insert Financials
    await db.insert(schoolFinancials).values({
      schoolId: orgId,
      cacRegistrationNumber: data.cacRegistrationNumber,
      tin: data.tin,
      settlementBankName: data.settlementBankName,
      accountNumber: data.accountNumber,
      accountName: data.accountName,
    });

    // 5. Upgrade the User to a SCHOOL_ADMIN (WAITING APPROVAL)
    const updatePayload = {
      role: "SCHOOL_ADMIN" as const,
      status: "PENDING" as const,
      schoolId: orgId,
    };

    const clerkMetadataPayload = {
      role: "SCHOOL_ADMIN",
      status: "PENDING",
      schoolId: orgId,
      schoolName: data.name,
      primaryColor: data.primaryColor || "#3b82f6",
    };

    const [updatedUsers] = await Promise.all([
      db
        .update(users)
        .set(updatePayload)
        .where(eq(users.clerkId, userId))
        .returning({ email: users.email }),
      client.users.updateUserMetadata(userId, {
        publicMetadata: clerkMetadataPayload,
      }),
    ]);

    // Failsafe: if the user record doesn't exist yet (webhook delay), create it
    if (updatedUsers.length === 0) {
      const clerkUser = await client.users.getUser(userId);
      await db.insert(users).values({
        clerkId: userId,
        email: clerkUser.emailAddresses[0].emailAddress,
        imageUrl: clerkUser.imageUrl,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        ...updatePayload,
      });
    }

    return { success: true, orgId };
  } catch (error: unknown) {
    console.error("[SCHOOL_ONBOARDING_ERROR]", error);
    return {
      error: error instanceof Error ? error.message : "Failed to create school",
    };
  }
}

export async function completeB2BOnboarding(data: {
  role: "STUDENT" | "TEACHER";
  schoolId: string;
  classOrSubject: string;
}) {
  const { userId } = await auth();

  if (!userId) {
    return { error: "No Logged In User" };
  }

  const client = await clerkClient();

  try {
    const clerkUser = await client.users.getUser(userId);

    const updatePayload = {
      role: data.role,
      status: "PENDING" as const, // Always pending until the School_Admin approves
      schoolId: data.schoolId,
    };

    const clerkMetadataPayload = {
      role: data.role,
      status: "PENDING",
      schoolId: data.schoolId,
    };

    // Update User Profile
    const [updatedUsers] = await Promise.all([
      db
        .update(users)
        .set(updatePayload)
        .where(eq(users.clerkId, userId))
        .returning({ id: users.id }),
      client.users.updateUserMetadata(userId, {
        publicMetadata: clerkMetadataPayload,
      }),
    ]);

    let dbUserId = updatedUsers[0]?.id;

    if (!dbUserId) {
      // Failsafe in case webhook was missed entirely
      const [newUser] = await db
        .insert(users)
        .values({
          clerkId: userId,
          email: clerkUser.emailAddresses[0].emailAddress,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
          ...updatePayload,
        })
        .returning({ id: users.id });
      dbUserId = newUser.id;
    }

    // Assign class/subject data depending on B2B role
    if (data.role === "TEACHER") {
      // Teachers state their subjects via expertise
      await db
        .update(users)
        .set({ expertise: data.classOrSubject })
        .where(eq(users.id, dbUserId));
    } else if (data.role === "STUDENT") {
      // Create student linkage for later processing
      await db.insert(students).values({
        userId: dbUserId,
        schoolId: data.schoolId,
      });
    }

    return { success: true };
  } catch (error: unknown) {
    console.error("[B2B_ONBOARDING_ERROR]", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to submit request",
    };
  }
}
