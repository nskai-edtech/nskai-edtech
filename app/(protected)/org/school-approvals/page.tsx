import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, schools, schoolLocations } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { SchoolApprovalsList } from "./_components/school-approvals-list";

export default async function PendingSchoolApprovalsPage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const role = sessionClaims?.metadata?.role;

  const caller = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  // Allow if either Clerk role is ORG_ADMIN OR DB role is ADMIN or isSuperAdmin flag is set
  const isAuthorized = 
    role === "ORG_ADMIN" || 
    caller?.role === "ADMIN" || 
    caller?.isSuperAdmin === true;

  if (!isAuthorized) {
    redirect("/");
  }

  // Fetch all pending school admins with their school data
  const pendingAdmins = await db
    .select({
      userId: users.id,
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
    .leftJoin(schoolLocations, eq(schools.id, schoolLocations.schoolId))
    .where(
      and(eq(users.role, "SCHOOL_ADMIN"), eq(users.status, "PENDING"))
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Pending School Approvals
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and approve new school registrations on the Zerra platform.
        </p>
      </div>

      <SchoolApprovalsList schools={pendingAdmins} />
    </div>
  );
}
