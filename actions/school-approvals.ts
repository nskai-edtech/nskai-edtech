"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, schools } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { sendEmail } from "@/lib/email";
import SchoolApprovedEmail from "@/emails/SchoolApprovedEmail";

export async function approveSchool(schoolId: string) {
  const { userId, sessionClaims } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const role = sessionClaims?.metadata?.role;

  // Verify the caller is an ORG_ADMIN
  const caller = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  const isAuthorized = 
    role === "ORG_ADMIN" || 
    caller?.role === "ADMIN" || 
    caller?.isSuperAdmin === true;

  if (!isAuthorized) {
    return { error: "Only platform admins can approve schools" };
  }

  // Find the school admin user for this school
  const schoolAdmin = await db.query.users.findFirst({
    where: and(eq(users.schoolId, schoolId), eq(users.role, "SCHOOL_ADMIN")),
  });

  if (!schoolAdmin) return { error: "No school admin found for this school" };

  const client = await clerkClient();

  // Update both DB and Clerk metadata
  await Promise.all([
    db
      .update(users)
      .set({ status: "ACTIVE" })
      .where(eq(users.id, schoolAdmin.id)),
    client.users.updateUserMetadata(schoolAdmin.clerkId, {
      publicMetadata: {
        role: "SCHOOL_ADMIN",
        status: "ACTIVE",
        schoolId,
      },
    }),
  ]);

  // Fetch school details for the email
  const schoolRecord = await db.query.schools.findFirst({
    where: eq(schools.id, schoolId)
  });

  if (schoolRecord && schoolAdmin.email) {
    try {
      await sendEmail({
        to: schoolAdmin.email,
        subject: "Your School Registration is Approved! 🎉",
        react: SchoolApprovedEmail({
          schoolName: schoolRecord.name,
          ownerName: schoolRecord.ownerName || schoolRecord.proprietorName || "Proprietor",
          loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://zerra.com"}/sign-in`
        })
      });
    } catch (emailError) {
      console.error("[SCHOOL_APPROVAL_EMAIL_ERROR]", emailError);
      // We don't return an error here because the core approval succeeded
    }
  }

  return { success: true };
}

export async function rejectSchool(schoolId: string) {
  const { userId, sessionClaims } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const role = sessionClaims?.metadata?.role;

  const caller = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  const isAuthorized = 
    role === "ORG_ADMIN" || 
    caller?.role === "ADMIN" || 
    caller?.isSuperAdmin === true;

  if (!isAuthorized) {
    return { error: "Only platform admins can reject schools" };
  }

  const schoolAdmin = await db.query.users.findFirst({
    where: and(eq(users.schoolId, schoolId), eq(users.role, "SCHOOL_ADMIN")),
  });

  if (!schoolAdmin) return { error: "No school admin found for this school" };

  const client = await clerkClient();

  await Promise.all([
    db
      .update(users)
      .set({ status: "REJECTED" })
      .where(eq(users.id, schoolAdmin.id)),
    client.users.updateUserMetadata(schoolAdmin.clerkId, {
      publicMetadata: {
        role: "SCHOOL_ADMIN",
        status: "REJECTED",
        schoolId,
      },
    }),
  ]);

  return { success: true };
}
