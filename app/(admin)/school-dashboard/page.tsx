import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, students } from "@/drizzle/schema";
import { eq, and, count } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OverviewChart } from "@/components/admin/overview-chart";
import { Users, GraduationCap, Banknote } from "lucide-react";

export default async function SchoolOverviewPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Identify School Admin
  const adminUser = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!adminUser || adminUser.role !== "SCHOOL_ADMIN" || !adminUser.schoolId) {
    redirect("/onboarding");
  }

  const schoolId = adminUser.schoolId;

  // KPIs
  // 1. Total Students
  const [studentsResult] = await db
    .select({ count: count() })
    .from(students)
    .where(eq(students.schoolId, schoolId));

  // 2. Active Teachers
  const [teachersResult] = await db
    .select({ count: count() })
    .from(users)
    .where(
      and(
        eq(users.schoolId, schoolId),
        eq(users.role, "TEACHER"),
        eq(users.status, "ACTIVE")
      )
    );

  // 3. Pending Approvals
  const [pendingResult] = await db
    .select({ count: count() })
    .from(users)
    .where(
      and(
        eq(users.schoolId, schoolId),
        eq(users.status, "PENDING")
      )
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Dashboard Overview
        </h1>
        <div className="flex items-center gap-2">
           <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
             Download Report
           </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Total Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{studentsResult.count}</div>
            <p className="text-xs text-zinc-500 mt-1">Currently enrolled and verified.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Active Teachers</CardTitle>
            <Users className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{teachersResult.count}</div>
            <p className="text-xs text-zinc-500 mt-1">Verified staff members.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Pending Approvals</CardTitle>
            <Banknote className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">{pendingResult.count}</div>
            <p className="text-xs text-zinc-500 mt-1">Users waiting for verifications.</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Financial Flow</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart />
          </CardContent>
        </Card>
        
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-10 text-zinc-500 text-sm">
               No recent activity to show.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
