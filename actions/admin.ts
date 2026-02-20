/* eslint-disable @typescript-eslint/ban-ts-comment */
"use server";

import { db } from "@/lib/db";
import { users, courses, purchases } from "@/drizzle/schema";
import { eq, desc, and, count, sql, aliasedTable } from "drizzle-orm";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";
import TutorApprovedEmail from "@/emails/TutorApprovedEmail";

export async function getTutors() {
  const { sessionClaims } = await auth();

  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    throw new Error("Unauthorized");
  }

  const tutors = await db.query.users.findMany({
    where: eq(users.role, "TUTOR"),
    orderBy: [desc(users.createdAt)],
  });

  return tutors;
}

export async function getAdminPendingCounts() {
  const { sessionClaims } = await auth();

  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    throw new Error("Unauthorized");
  }

  const [pendingCourses] = await db
    .select({ count: count() })
    .from(courses)
    .where(eq(courses.status, "PENDING"));

  const [pendingTutors] = await db
    .select({ count: count() })
    .from(users)
    .where(and(eq(users.role, "TUTOR"), eq(users.status, "PENDING")));

  return {
    pendingCourses: pendingCourses?.count ?? 0,
    pendingTutors: pendingTutors?.count ?? 0,
  };
}

export async function getTutorsWithCourseCount() {
  const { sessionClaims } = await auth();

  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    throw new Error("Unauthorized");
  }

  const tutorsWithCourses = await db
    .select({
      id: users.id,
      clerkId: users.clerkId,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      bio: users.bio,
      expertise: users.expertise,
      role: users.role,
      status: users.status,
      imageUrl: users.imageUrl,
      paystackCustomerCode: users.paystackCustomerCode,
      interests: users.interests,
      learningGoal: users.learningGoal,
      createdAt: users.createdAt,
      courseCount: sql<number>`cast(count(case when ${courses.isPublished} = true then 1 end) as integer)`,
    })
    .from(users)
    .leftJoin(courses, eq(users.id, courses.tutorId))
    .where(eq(users.role, "TUTOR"))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt));

  return tutorsWithCourses;
}

export async function getTutorById(tutorId: string) {
  const { sessionClaims } = await auth();

  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    throw new Error("Unauthorized");
  }

  const tutor = await db.query.users.findFirst({
    where: eq(users.id, tutorId),
  });

  if (!tutor) return null;

  // Aggregate stats
  const [stats] = await db
    .select({
      totalCourses: sql<number>`cast(count(distinct ${courses.id}) as integer)`,
      totalStudents: sql<number>`cast(count(distinct ${purchases.userId}) as integer)`,
    })
    .from(courses)
    .leftJoin(purchases, eq(courses.id, purchases.courseId))
    .where(eq(courses.tutorId, tutorId));

  return {
    ...tutor,
    totalCourses: stats?.totalCourses ?? 0,
    totalStudents: stats?.totalStudents ?? 0,
  };
}

// Get all courses for a specific tutor (admin view) with enrollment counts
export async function getTutorCoursesForAdmin(tutorId: string) {
  const { sessionClaims } = await auth();

  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    throw new Error("Unauthorized");
  }

  const tutorCourses = await db
    .select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
      imageUrl: courses.imageUrl,
      status: courses.status,
      price: courses.price,
      isPublished: courses.isPublished,
      createdAt: courses.createdAt,
      studentsEnrolled: sql<number>`cast(count(distinct ${purchases.id}) as integer)`,
    })
    .from(courses)
    .leftJoin(purchases, eq(courses.id, purchases.courseId))
    .where(eq(courses.tutorId, tutorId))
    .groupBy(courses.id)
    .orderBy(desc(courses.createdAt));

  return tutorCourses;
}

// Approve a Tutor
export async function approveTutor(tutorId: string) {
  const { sessionClaims } = await auth();

  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    const tutor = await db.query.users.findFirst({
      where: eq(users.id, tutorId),
    });

    if (!tutor) {
      return { error: "Tutor not found" };
    }

    // Update database status
    await db
      .update(users)
      .set({ status: "ACTIVE" })
      .where(eq(users.id, tutorId));

    try {
      const client = await clerkClient();
      await client.users.updateUserMetadata(tutor.clerkId, {
        publicMetadata: {
          status: "ACTIVE",
        },
      });
    } catch (clerkError) {
      console.warn(
        "Clerk Sync Failed (User might be deleted in Clerk):",
        clerkError,
      );
    }

    revalidatePath("/org");

    sendEmail({
      to: tutor.email,
      subject: "Your NSKAI tutor application is approved!",
      react: TutorApprovedEmail({
        name: tutor.firstName || "Tutor",
      }),
    }).catch(() => {});

    return { success: true };
  } catch (error) {
    console.error("Approval Error:", error);
    return { error: `Failed to approve: ${(error as Error).message}` };
  }
}

// Suspend a Tutor
export async function suspendTutor(tutorId: string) {
  const { sessionClaims } = await auth();

  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    const tutor = await db.query.users.findFirst({
      where: eq(users.id, tutorId),
    });

    if (!tutor) {
      return { error: "Tutor not found" };
    }

    await db
      .update(users)
      .set({ status: "SUSPENDED" })
      .where(eq(users.id, tutorId));

    try {
      const client = await clerkClient();
      await client.users.updateUserMetadata(tutor.clerkId, {
        publicMetadata: { status: "SUSPENDED" },
      });
    } catch (clerkError) {
      console.warn(
        "Clerk Sync Failed (User might be deleted in Clerk):",
        clerkError,
      );
    }

    revalidatePath("/org");
    return { success: true };
  } catch (error) {
    console.error("Suspend Error:", error);
    return { error: `Failed to suspend: ${(error as Error).message}` };
  }
}

// Unsuspend (Reactivate) a Tutor
export async function unsuspendTutor(tutorId: string) {
  const { sessionClaims } = await auth();

  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    const tutor = await db.query.users.findFirst({
      where: eq(users.id, tutorId),
    });

    if (!tutor) {
      return { error: "Tutor not found" };
    }

    await db
      .update(users)
      .set({ status: "ACTIVE" })
      .where(eq(users.id, tutorId));

    try {
      const client = await clerkClient();
      await client.users.updateUserMetadata(tutor.clerkId, {
        publicMetadata: { status: "ACTIVE" },
      });
    } catch (clerkError) {
      console.warn(
        "Clerk Sync Failed (User might be deleted in Clerk):",
        clerkError,
      );
    }

    revalidatePath("/org");
    return { success: true };
  } catch (error) {
    console.error("Unsuspend Error:", error);
    return { error: `Failed to unsuspend: ${(error as Error).message}` };
  }
}

// Ban a Tutor
export async function banTutor(tutorId: string) {
  const { sessionClaims } = await auth();

  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    const tutor = await db.query.users.findFirst({
      where: eq(users.id, tutorId),
    });

    if (!tutor) {
      return { error: "Tutor not found" };
    }

    await db
      .update(users)
      .set({ status: "BANNED" })
      .where(eq(users.id, tutorId));

    try {
      const client = await clerkClient();
      await client.users.updateUserMetadata(tutor.clerkId, {
        publicMetadata: { status: "BANNED" },
      });
    } catch (clerkError) {
      console.warn(
        "Clerk Sync Failed (User might be deleted in Clerk):",
        clerkError,
      );
    }

    revalidatePath("/org");
    return { success: true };
  } catch (error) {
    console.error("Ban Error:", error);
    return { error: `Failed to ban: ${(error as Error).message}` };
  }
}

// Unban a Tutor
export async function unbanTutor(tutorId: string) {
  const { sessionClaims } = await auth();

  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    const tutor = await db.query.users.findFirst({
      where: eq(users.id, tutorId),
    });

    if (!tutor) {
      return { error: "Tutor not found" };
    }

    await db
      .update(users)
      .set({ status: "ACTIVE" })
      .where(eq(users.id, tutorId));

    try {
      const client = await clerkClient();
      await client.users.updateUserMetadata(tutor.clerkId, {
        publicMetadata: { status: "ACTIVE" },
      });
    } catch (clerkError) {
      console.warn(
        "Clerk Sync Failed (User might be deleted in Clerk):",
        clerkError,
      );
    }

    revalidatePath("/org");
    return { success: true };
  } catch (error) {
    console.error("Unban Error:", error);
    return { error: `Failed to unban: ${(error as Error).message}` };
  }
}

// Get all learners (paginated) with purchase stats
export async function getLearners(page: number = 1, limit: number = 20) {
  const { sessionClaims } = await auth();

  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    throw new Error("Unauthorized");
  }

  const offset = (page - 1) * limit;

  // Total count
  const [totalResult] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.role, "LEARNER"));

  const totalCount = totalResult?.count ?? 0;

  // Learners with purchase count and total spend
  const learners = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      imageUrl: users.imageUrl,
      status: users.status,
      interests: users.interests,
      learningGoal: users.learningGoal,
      createdAt: users.createdAt,
      coursesPurchased: sql<number>`cast(count(distinct ${purchases.id}) as integer)`,
      totalSpent: sql<number>`coalesce(sum(${purchases.amount}), 0)`,
    })
    .from(users)
    .leftJoin(purchases, eq(users.id, purchases.userId))
    .where(eq(users.role, "LEARNER"))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    learners,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

// Get a single learner by ID with their purchased courses
export async function getLearnerById(learnerId: string) {
  const { sessionClaims } = await auth();

  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    throw new Error("Unauthorized");
  }

  const learner = await db.query.users.findFirst({
    where: and(eq(users.id, learnerId), eq(users.role, "LEARNER")),
  });

  if (!learner) return null;

  // Use aliased table for tutor to avoid self-join conflict
  const tutors = aliasedTable(users, "tutor");

  // Get purchased courses with details
  const purchasedCourses = await db
    .select({
      purchaseId: purchases.id,
      courseId: courses.id,
      courseTitle: courses.title,
      courseImageUrl: courses.imageUrl,
      coursePrice: courses.price,
      tutorFirstName: tutors.firstName,
      tutorLastName: tutors.lastName,
      purchaseAmount: purchases.amount,
      purchasedAt: purchases.createdAt,
    })
    .from(purchases)
    .innerJoin(courses, eq(purchases.courseId, courses.id))
    .leftJoin(tutors, eq(courses.tutorId, tutors.id))
    .where(eq(purchases.userId, learnerId))
    .orderBy(desc(purchases.createdAt));

  const totalSpent = purchasedCourses.reduce(
    (sum, p) => sum + (p.purchaseAmount ?? 0),
    0,
  );

  return {
    ...learner,
    purchasedCourses,
    totalSpent,
    totalCourses: purchasedCourses.length,
  };
}

// Get overview stats for org dashboard
export async function getOrgOverviewStats() {
  const { sessionClaims } = await auth();

  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    throw new Error("Unauthorized");
  }

  // Total Revenue
  const [revenueResult] = await db
    .select({
      total: sql<number>`coalesce(sum(${purchases.amount}), 0)`,
    })
    .from(purchases);

  // Total Learners
  const [learnerResult] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.role, "LEARNER"));

  // Active Tutors
  const [tutorResult] = await db
    .select({ count: count() })
    .from(users)
    .where(and(eq(users.role, "TUTOR"), eq(users.status, "ACTIVE")));

  // Published Courses
  const [courseResult] = await db
    .select({ count: count() })
    .from(courses)
    .where(eq(courses.status, "PUBLISHED"));

  return {
    totalRevenue: revenueResult?.total ?? 0,
    totalLearners: learnerResult?.count ?? 0,
    activeTutors: tutorResult?.count ?? 0,
    publishedCourses: courseResult?.count ?? 0,
  };
}

// Get recent pending activity for org dashboard
export async function getRecentPendingActivity() {
  const { sessionClaims } = await auth();

  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    throw new Error("Unauthorized");
  }

  // Pending Tutor Applications (latest 5)
  const pendingTutors = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      expertise: users.expertise,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(and(eq(users.role, "TUTOR"), eq(users.status, "PENDING")))
    .orderBy(desc(users.createdAt))
    .limit(5);

  // Pending Course Submissions (latest 5)
  const tutors = aliasedTable(users, "tutor");
  const pendingCourses = await db
    .select({
      id: courses.id,
      title: courses.title,
      createdAt: courses.createdAt,
      tutorFirstName: tutors.firstName,
      tutorLastName: tutors.lastName,
    })
    .from(courses)
    .leftJoin(tutors, eq(courses.tutorId, tutors.id))
    .where(eq(courses.status, "PENDING"))
    .orderBy(desc(courses.createdAt))
    .limit(5);

  return {
    pendingTutors,
    pendingCourses,
  };
}
