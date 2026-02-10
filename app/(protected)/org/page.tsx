/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  getOrgOverviewStats,
  getRecentPendingActivity,
  getAdminPendingCounts,
} from "@/actions/admin";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Shield,
  DollarSign,
  Users,
  GraduationCap,
  BookOpen,
  UserPlus,
  FileText,
  ChevronRight,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default async function OrgDashboard() {
  const { sessionClaims } = await auth();

  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    redirect("/");
  }

  const [stats, activity, counts] = await Promise.all([
    getOrgOverviewStats(),
    getRecentPendingActivity(),
    getAdminPendingCounts(),
  ]);

  const formatCurrency = (amountInKobo: number) => {
    return `₦${(amountInKobo / 100).toLocaleString()}`;
  };

  const timeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const statCards = [
    {
      label: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      iconBg: "bg-green-100 dark:bg-green-900/40",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      label: "Total Learners",
      value: stats.totalLearners.toLocaleString(),
      icon: Users,
      iconBg: "bg-blue-100 dark:bg-blue-900/40",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Active Tutors",
      value: stats.activeTutors.toLocaleString(),
      icon: GraduationCap,
      iconBg: "bg-purple-100 dark:bg-purple-900/40",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      label: "Published Courses",
      value: stats.publishedCourses.toLocaleString(),
      icon: BookOpen,
      iconBg: "bg-orange-100 dark:bg-orange-900/40",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-primary-text">
          <Shield className="w-7 h-7 md:w-8 md:h-8 text-brand" />
          Organization Overview
        </h1>
        <p className="text-secondary-text mt-2">Your platform at a glance.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface border border-border rounded-xl p-5 flex items-start justify-between"
          >
            <div>
              <p className="text-sm text-secondary-text font-medium">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-primary-text mt-1">
                {stat.value}
              </p>
            </div>
            <div
              className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center shrink-0`}
            >
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Pending Counts Banner */}
      {(counts.pendingTutors > 0 || counts.pendingCourses > 0) && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <Clock className="w-5 h-5" />
            <span className="font-semibold text-sm">Pending Actions</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {counts.pendingTutors > 0 && (
              <Link
                href="/org/tutor-approvals"
                className="text-amber-700 dark:text-amber-400 hover:underline font-medium"
              >
                {counts.pendingTutors} tutor application
                {counts.pendingTutors !== 1 ? "s" : ""}
              </Link>
            )}
            {counts.pendingCourses > 0 && (
              <Link
                href="/org/approvals"
                className="text-amber-700 dark:text-amber-400 hover:underline font-medium"
              >
                {counts.pendingCourses} course submission
                {counts.pendingCourses !== 1 ? "s" : ""}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary-text">
            Recent Activity
          </h2>
        </div>

        <div className="divide-y divide-border">
          {/* Pending Tutor Applications */}
          {activity.pendingTutors.map((tutor) => (
            <div
              key={tutor.id}
              className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-primary-text">
                  New Tutor Application
                </p>
                <p className="text-xs text-secondary-text mt-0.5">
                  <span className="font-medium text-primary-text">
                    {tutor.firstName} {tutor.lastName}
                  </span>{" "}
                  applied
                  {tutor.expertise ? (
                    <>
                      {" "}
                      for{" "}
                      <span className="font-medium text-primary-text">
                        {tutor.expertise}
                      </span>
                    </>
                  ) : null}
                </p>
                <div className="mt-2">
                  <Link
                    href="/org/tutor-approvals"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-brand text-white text-xs font-medium hover:bg-brand/90 transition-colors"
                  >
                    Review
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
              <span className="text-xs text-secondary-text shrink-0">
                {timeAgo(tutor.createdAt)}
              </span>
            </div>
          ))}

          {/* Pending Course Submissions */}
          {activity.pendingCourses.map((course) => (
            <div
              key={course.id}
              className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-primary-text">
                  Course Pending Review
                </p>
                <p className="text-xs text-secondary-text mt-0.5">
                  <span className="font-medium text-primary-text">
                    {course.title}
                  </span>{" "}
                  submitted by{" "}
                  <span className="font-medium text-primary-text">
                    {course.tutorFirstName} {course.tutorLastName}
                  </span>
                </p>
                <div className="mt-2">
                  <Link
                    href={`/org/approvals/${course.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-brand text-white text-xs font-medium hover:bg-brand/90 transition-colors"
                  >
                    Review Course
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
              <span className="text-xs text-secondary-text shrink-0">
                {timeAgo(course.createdAt)}
              </span>
            </div>
          ))}

          {/* Empty state */}
          {activity.pendingTutors.length === 0 &&
            activity.pendingCourses.length === 0 && (
              <div className="px-5 py-12 text-center">
                <Clock className="w-10 h-10 text-secondary-text/30 mx-auto mb-3" />
                <p className="text-sm font-semibold text-primary-text">
                  All caught up!
                </p>
                <p className="text-xs text-secondary-text mt-1">
                  No pending approvals at the moment.
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
