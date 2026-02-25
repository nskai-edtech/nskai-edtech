import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { getTutorSubmissions } from "@/actions/assessments/queries";
import { SubmissionsTable } from "@/components/dashboard/submissions-table";
import { Clock, CheckCircle, FileText } from "lucide-react";

export default async function TutorSubmissionsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const currentUser = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!currentUser || currentUser.role !== "TUTOR") {
    redirect("/");
  }

  // Fetch the submissions data
  const submissions = await getTutorSubmissions();

  // Basic stats for the header
  const totalSubmissions = submissions.length;
  const pendingSubmissions = submissions.filter(
    (s) => s.status === "PENDING",
  ).length;
  const gradedSubmissions = submissions.filter(
    (s) => s.status === "GRADED",
  ).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-primary-text mb-2">
          Project Submissions
        </h1>
        <p className="text-secondary-text">
          Review, grade, and provide feedback on your students&apos; project
          submissions.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-secondary-text uppercase tracking-wider">
              Total Submissions
            </h3>
            <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-primary-text">
            {totalSubmissions}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-secondary-text uppercase tracking-wider">
              Needs Review
            </h3>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-primary-text">
            {pendingSubmissions}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-secondary-text uppercase tracking-wider">
              Graded
            </h3>
            <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-primary-text">
            {gradedSubmissions}
          </div>
        </div>
      </div>

      {/* Main Table Component */}
      <SubmissionsTable initialSubmissions={submissions} />
    </div>
  );
}
