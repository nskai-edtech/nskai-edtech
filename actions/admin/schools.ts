"use server";

import { db } from "@/lib/db";
import { users, schools, schoolLocations } from "@/drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

import { auth } from "@clerk/nextjs/server";

export async function getApprovedSchools() {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    const role = (sessionClaims?.metadata as { role?: string })?.role;

    const caller = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    const isPlatformAdmin = 
      role === "ORG_ADMIN" || 
      caller?.role === "ADMIN" || 
      caller?.isSuperAdmin === true;

    if (!isPlatformAdmin) {
      throw new Error("Forbidden: Requires platform admin privileges.");
    }

    // Join users and schools where role is SCHOOL_ADMIN and status is ACTIVE
    const activeSchools = await db
      .select({
        userId: users.clerkId,
        userEmail: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        schoolId: schools.id,
        schoolName: schools.name,
        schoolType: schools.schoolType,
        logoUrl: schools.logoUrl,
        primaryColor: schools.primaryColor,
        ownerName: schools.ownerName,
        ownerEmail: schools.ownerEmail,
        createdAt: schools.createdAt,
        country: schoolLocations.country,
        state: schoolLocations.state,
        lga: schoolLocations.lga,
      })
      .from(users)
      .innerJoin(schools, eq(users.schoolId, schools.id))
      .innerJoin(schoolLocations, eq(schools.id, schoolLocations.schoolId))
      .where(and(eq(users.role, "SCHOOL_ADMIN"), eq(users.status, "ACTIVE")))
      .orderBy(desc(schools.createdAt));

    return { schools: activeSchools };
  } catch (error) {
    console.error("[GET_APPROVED_SCHOOLS_ERROR]", error);
    return { error: error instanceof Error ? error.message : "Failed to fetch approved schools" };
  }
}
