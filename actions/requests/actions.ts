"use server";

import { db } from "@/lib/db";
import { courses, courseRequests, users } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function submitCourseRequest(
  courseId: string,
  type: "DRAFT" | "DELETE",
  reason: string,
) {
  const { userId } = await auth();
  if (!userId) return { error: "Unauthorized" };

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });
  if (!user) return { error: "User not found" };

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  });
  if (!course) return { error: "Course not found" };
  if (course.tutorId !== user.id) return { error: "Not authorized" };

  // Check if there is already a PENDING request for this course.
  const existingPending = await db.query.courseRequests.findFirst({
    where: and(
      eq(courseRequests.courseId, courseId),
      eq(courseRequests.status, "PENDING"),
    ),
  });

  if (existingPending) {
    return { error: "A request is already pending for this course." };
  }

  if (reason.length > 3500) {
    return { error: "Reason exceeds maximum length." };
  }

  try {
    const [request] = await db
      .insert(courseRequests)
      .values({
        courseId,
        userId: user.id,
        type,
        reason,
        status: "PENDING",
      })
      .returning();

    revalidatePath(`/tutor/courses/${courseId}`);
    revalidatePath("/tutor/courses");
    return { success: true, request };
  } catch (error) {
    console.error("Failed to submit course request:", error);
    return { error: "Failed to submit course request" };
  }
}

export async function approveCourseRequest(requestId: string) {
  const { sessionClaims } = await auth();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN")
    return { error: "Unauthorized" };

  const request = await db.query.courseRequests.findFirst({
    where: eq(courseRequests.id, requestId),
  });

  if (!request || request.status !== "PENDING") {
    return { error: "Invalid or already resolved request" };
  }

  try {
    // 1. Mark request as APPROVED
    await db
      .update(courseRequests)
      .set({ status: "APPROVED", resolvedAt: new Date() })
      .where(eq(courseRequests.id, requestId));

    // 2. Perform the requested action
    if (request.type === "DRAFT") {
      await db
        .update(courses)
        .set({ status: "DRAFT" })
        .where(eq(courses.id, request.courseId));
    } else if (request.type === "DELETE") {
      await db.delete(courses).where(eq(courses.id, request.courseId));
    }

    revalidatePath("/org/requests");
    revalidatePath(`/tutor/courses/${request.courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to approve course request:", error);
    return { error: "Failed to approve course request" };
  }
}

export async function rejectCourseRequest(requestId: string) {
  const { sessionClaims } = await auth();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN")
    return { error: "Unauthorized" };

  const request = await db.query.courseRequests.findFirst({
    where: eq(courseRequests.id, requestId),
  });

  if (!request || request.status !== "PENDING") {
    return { error: "Invalid or already resolved request" };
  }

  try {
    await db
      .update(courseRequests)
      .set({ status: "REJECTED", resolvedAt: new Date() })
      .where(eq(courseRequests.id, requestId));

    revalidatePath("/org/requests");
    revalidatePath(`/tutor/courses/${request.courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to reject course request:", error);
    return { error: "Failed to reject course request" };
  }
}
