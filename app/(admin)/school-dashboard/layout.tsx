import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/db";
import { users, schools } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { Sidebar } from "@/components/admin/sidebar";
import { TopHeader } from "@/components/admin/top-header";

export default async function SchoolDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // 1. Fetch user to ensure they are a SCHOOL_ADMIN and get their schoolId
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!user || user.role !== "SCHOOL_ADMIN" || !user.schoolId) {
    redirect("/onboarding"); // Not authorized for this dashboard
  }

  // 2. Fetch the School to inject dynamic brand colors/logos
  const school = await db.query.schools.findFirst({
    where: eq(schools.id, user.schoolId),
  });

  if (!school) {
    redirect("/onboarding");
  }

  // 3. PENDING State Intercept
  if (user.status === "PENDING") {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 p-4 dark:bg-zinc-950">
        <div className="flex w-full max-w-md flex-col items-center justify-center space-y-6 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          {school.logoUrl ? (
            <Image 
              src={school.logoUrl} 
              alt={`${school.name} Logo`} 
              width={80}
              height={80}
              className="h-20 w-20 rounded-full object-cover shadow-sm ring-4 ring-gray-50 dark:ring-zinc-800"
            />
          ) : (
            <div 
              className="flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold text-white shadow-sm ring-4 ring-gray-50 dark:ring-zinc-800"
              style={{ backgroundColor: school.primaryColor || "#3b82f6" }}
            >
              {school.name.charAt(0)}
            </div>
          )}
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Application Under Review
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your registration for <strong>{school.name}</strong> has been received. Our team is currently reviewing your application. You will be notified via email once approved.
            </p>
          </div>

          <div className="mt-4 flex w-full flex-col gap-3">
             <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
                <div 
                  className="h-full rounded-full animate-pulse" 
                  style={{ backgroundColor: school.primaryColor || "#3b82f6", width: "100%" }}
                />
             </div>
             <p className="text-xs font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
               Pending Super Admin Approval
             </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-gray-50/50 dark:bg-zinc-950">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-white dark:bg-zinc-900 md:block md:w-64 md:shrink-0">
        <Sidebar school={school} />
      </div>

      {/* Main Content Vertical Stack */}
      <div className="flex w-full flex-col overflow-hidden">
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b bg-white dark:bg-zinc-900 px-4 md:px-6 shadow-sm">
          <TopHeader school={school} user={user} />
        </header>

        {/* Scrollable Page Payload */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
