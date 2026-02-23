"use server";

import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { CompletedCourse, CertificateData } from "./types";
import { fetchUserCourseProgress } from "./queries";

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
        "NSK.AI Instructor",
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
  { error: string } | CertificateData[]
> {
  try {
    const user = await getAuthenticatedUser();
    const completedData = await fetchUserCourseProgress(user.id);
    const learnerName =
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Learner";

    return completedData.map((c) => ({
      courseId: c.courseId,
      courseTitle: c.courseTitle,
      courseImageUrl: c.courseImageUrl,
      learnerName,
      tutorName:
        `${c.tutorFirstName || ""} ${c.tutorLastName || ""}`.trim() ||
        "NSK.AI Instructor",
      completionDate: c.completionDate || new Date(),
    }));
  } catch (error) {
    console.error("[GET_USER_CERTIFICATES]", error);
    return { error: "Failed to fetch certificates" };
  }
}

export async function getCertificateData(
  courseId: string,
): Promise<{ error: string } | CertificateData> {
  try {
    const user = await getAuthenticatedUser();
    const completedData = await fetchUserCourseProgress(user.id, courseId);

    if (completedData.length === 0) {
      return { error: "Course not completed, not enrolled, or has no lessons" };
    }

    const course = completedData[0];
    const learnerName =
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Learner";

    return {
      courseId: course.courseId,
      courseTitle: course.courseTitle,
      courseImageUrl: course.courseImageUrl,
      learnerName,
      tutorName:
        `${course.tutorFirstName || ""} ${course.tutorLastName || ""}`.trim() ||
        "NSK.AI Instructor",
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
