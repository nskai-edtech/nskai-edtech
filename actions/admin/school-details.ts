import { db } from "@/lib/db";
import { schools, schoolLocations, schoolFinancials, users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

import { auth } from "@clerk/nextjs/server";

export async function getSchoolDetails(schoolId: string) {
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

    // 1. Fetch School Base Identity
    const school = await db.query.schools.findFirst({
      where: eq(schools.id, schoolId),
    });

    if (!school) {
      return { error: "School not found" };
    }

    // 2. Fetch Location Details
    const location = await db.query.schoolLocations.findFirst({
      where: eq(schoolLocations.schoolId, schoolId),
    });

    // 3. Fetch Financial Details
    const financial = await db.query.schoolFinancials.findFirst({
      where: eq(schoolFinancials.schoolId, schoolId),
    });

    // 4. Fetch the associated School Admin User
    const adminUser = await db.query.users.findFirst({
      where: eq(users.schoolId, schoolId),
    });

    return { 
      school, 
      location, 
      financial, 
      adminUser 
    };

  } catch (error) {
    console.error("[GET_SCHOOL_DETAILS_ERROR]", error);
    return { error: error instanceof Error ? error.message : "Failed to fetch school details" };
  }
}
