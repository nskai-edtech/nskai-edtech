import { getTutorDashboardStats } from "@/actions/courses";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  DollarSign,
  Users,
  Clock,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";

export default async function TutorDashboard() {
  const stats = await getTutorDashboardStats();

  // Format price from Kobo to Naira
  const formatPrice = (priceInKobo: number) => {
    return `₦${(priceInKobo / 100).toLocaleString()}`;
  };

  // no courses yet
  if (stats.totalCourses === 0) {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="w-20 h-20 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-brand" />
          </div>
          <h1 className="text-3xl font-bold text-primary-text mb-4">
            Welcome to Your Dashboard
          </h1>
          <p className="text-secondary-text mb-8 max-w-md mx-auto">
            You haven&apos;t created any courses yet. Start by creating your
            first course to begin teaching and earning.
          </p>
          <Link
            href="/tutor/courses/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand/90 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-brand/20"
          >
            <Plus className="w-5 h-5" />
            Create Your First Course
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary-text">
          Performance Analytics
        </h1>
        <p className="text-secondary-text mt-1">
          Detailed overview of your teaching revenue, engagement, and reach.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +0%
            </span>
          </div>
          <p className="text-xs text-secondary-text uppercase tracking-wider font-semibold">
            Total Revenue
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-primary-text">
              {formatPrice(stats.totalRevenue)}
            </span>
            <span className="text-xs text-secondary-text">lifetime</span>
          </div>
        </div>

        {/* Total Students */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +0%
            </span>
          </div>
          <p className="text-xs text-secondary-text uppercase tracking-wider font-semibold">
            Total Students
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-primary-text">
              {stats.totalStudents.toLocaleString()}
            </span>
            <span className="text-xs text-secondary-text">active learners</span>
          </div>
        </div>

        {/* Total Courses */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            {/* Value trend not yet tracked */}
          </div>
          <p className="text-xs text-secondary-text uppercase tracking-wider font-semibold">
            Total Courses
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-primary-text">
              {stats.totalCourses}
            </span>
            <span className="text-xs text-secondary-text">created</span>
          </div>
        </div>

        {/* Avg Watch Time (Just placeholder for design consistency for now) */}
        <div className="bg-surface border border-border rounded-xl p-5 opacity-60">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-xs text-secondary-text uppercase tracking-wider font-semibold">
            Avg Watch Time
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-primary-text">--</span>
            <span className="text-xs text-secondary-text">coming soon</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Student Growth Chart */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-primary-text">
                Revenue vs. Student Growth
              </h3>
              <p className="text-sm text-secondary-text">
                Monthly tracking over the last 6 months
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-secondary-text">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-400" />
                <span className="text-secondary-text">Students</span>
              </div>
            </div>
          </div>
          {/* Chart Placeholder */}
          <div className="h-64 flex items-center justify-center bg-surface-muted/50 rounded-lg border border-dashed border-border">
            <p className="text-secondary-text text-sm">
              Advanced analytics coming soon
            </p>
          </div>
        </div>

        {/* Top Courses */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary-text">
              Top Courses
            </h3>
            <Link
              href="/tutor/courses"
              className="text-sm text-brand hover:underline font-medium"
            >
              View All
            </Link>
          </div>

          {stats.topCourses.length > 0 ? (
            <div className="space-y-4">
              {stats.topCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-muted/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-muted shrink-0">
                    {course.imageUrl ? (
                      <Image
                        src={course.imageUrl}
                        alt={course.title}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-secondary-text" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-primary-text text-sm truncate">
                      {course.title}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-secondary-text">
                      <Users className="w-3 h-3" />
                      <span>{course.students} enrolled</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-primary-text">
                      {formatPrice(course.price || 0)}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">
                      {formatPrice(course.revenue)} earned
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center bg-surface-muted/30 rounded-lg border border-dashed border-border">
              <p className="text-secondary-text text-sm font-medium">
                No course data yet
              </p>
              <p className="text-xs text-secondary-text mt-1">
                Your top performing courses will appear here
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-4">
        <Link
          href="/tutor/courses/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New Course
        </Link>
        <Link
          href="/tutor/courses"
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-border hover:bg-surface-muted rounded-lg font-medium text-primary-text transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          Manage Courses
        </Link>
      </div>
    </div>
  );
}
