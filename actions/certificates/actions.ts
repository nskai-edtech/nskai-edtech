"use server";

import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { users } from "@/drizzle/schema";
import { fetchUserCourseProgress } from "./queries";
import { auth } from "@clerk/nextjs/server";
import { CompletedCourse, CertificateData } from "./types";

// --- HELPER: AUTH & USER FETCH ---
async function getAuthenticatedUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!user) throw new Error("User not found");
  return user;
}

// --- ACTIONS ---

export async function getCompletedCourses(): Promise<
  { error: string } | { courses: CompletedCourse[] }
> {
  try {
    const user = await getAuthenticatedUser();
    const completedData = await fetchUserCourseProgress(user.id);

    const courses: CompletedCourse[] = completedData.map((c) => ({
      courseId: c.courseId,
      courseTitle: c.courseTitle,
      courseImageUrl: c.courseImageUrl,
      tutorName:
        `${c.tutorFirstName || ""} ${c.tutorLastName || ""}`.trim() ||
        "ZERRA Instructor",
      completionDate: c.completionDate || new Date(),
      totalLessons: c.totalLessons,
    }));

    return { courses };
  } catch (error) {
    console.error("[GET_COMPLETED_COURSES]", error);
    return { error: "Failed to get completed courses" };
  }
}

export async function getUserCertificates(): Promise<
  { error: string } | (CertificateData & { id: string })[]
> {
  try {
    const user = await getAuthenticatedUser();
    const completedData = await fetchUserCourseProgress(user.id);
    const learnerName =
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Learner";

    // Fetch existing DB certs so we can reuse IDs
    const dbCerts = await db.query.certificates.findMany({
      where: eq(db._.fullSchema.certificates.userId, user.clerkId),
    });

    // Build a mutable map for quick look-ups
    const certMap = new Map(dbCerts.map((c) => [c.courseId, c]));

    // Upsert missing certificate rows so every completed course has an ID
    const missing = completedData.filter((c) => !certMap.has(c.courseId));
    if (missing.length > 0) {
      const inserted = await db
        .insert(db._.fullSchema.certificates)
        .values(
          missing.map((c) => ({
            userId: user.clerkId,
            courseId: c.courseId,
          })),
        )
        .returning();
      for (const row of inserted) {
        certMap.set(row.courseId, row);
      }
    }

    return completedData.map((c) => {
      const dbRecord = certMap.get(c.courseId)!;
      return {
        id: dbRecord.id,
        courseId: c.courseId,
        courseTitle: c.courseTitle,
        courseImageUrl: c.courseImageUrl,
        learnerName,
        tutorName:
          `${c.tutorFirstName || ""} ${c.tutorLastName || ""}`.trim() ||
          "ZERRA Instructor",
        completionDate: c.completionDate || new Date(),
      };
    });
  } catch (error) {
    console.error("[GET_USER_CERTIFICATES]", error);
    return { error: "Failed to fetch certificates" };
  }
}

export async function getCertificateData(
  courseId: string,
): Promise<{ error: string } | (CertificateData & { id: string })> {
  try {
    const user = await getAuthenticatedUser();
    const completedData = await fetchUserCourseProgress(user.id, courseId);

    if (completedData.length === 0) {
      return { error: "Course not completed, not enrolled, or has no lessons" };
    }

    const course = completedData[0];
    const learnerName =
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Learner";

    // 1. CHECK IF CERTIFICATE ALREADY EXISTS OR CREATE ONE
    let certificateRecord = await db.query.certificates.findFirst({
      where: (certificates, { and, eq }) =>
        and(
          eq(certificates.userId, user.clerkId),
          eq(certificates.courseId, courseId),
        ),
    });

    if (!certificateRecord) {
      const [newCert] = await db
        .insert(db._.fullSchema.certificates)
        .values({
          userId: user.clerkId,
          courseId: courseId,
        })
        .returning();
      certificateRecord = newCert;
    }

    return {
      id: certificateRecord.id, // This is the public verification ID
      courseId: course.courseId,
      courseTitle: course.courseTitle,
      courseImageUrl: course.courseImageUrl,
      learnerName,
      tutorName:
        `${course.tutorFirstName || ""} ${course.tutorLastName || ""}`.trim() ||
        "ZERRA Instructor",
      completionDate: course.completionDate || new Date(),
    };
  } catch (error) {
    console.error("[GET_CERTIFICATE_DATA]", error);
    return { error: "Failed to get certificate data" };
  }
}

export async function checkCertificateEligibility(
  courseId: string,
): Promise<{ eligible: boolean; error?: string }> {
  try {
    const user = await getAuthenticatedUser();
    const completedData = await fetchUserCourseProgress(user.id, courseId);

    return { eligible: completedData.length > 0 };
  } catch (error) {
    console.error("[CHECK_CERTIFICATE_ELIGIBILITY]", error);
    return { eligible: false, error: "Failed to check eligibility" };
  }
}
