import { getTutorCourses } from "@/actions/courses";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  DollarSign,
  Users,
  Clock,
  TrendingUp,
  Star,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";

export default async function TutorDashboard() {
  const { courses, totalCount } = await getTutorCourses(1, 100);

  const publishedCourses = courses.filter((c) => c.isPublished);
  const hasPublishedCourses = publishedCourses.length > 0;

  // Calculate stats (mock values since we don't have real student/revenue data yet)
  // All stats are 0 when no real data exists
  const totalRevenue = 0;
  const totalStudents = 0;
  const avgWatchTime = { minutes: 0, seconds: 0 };
  const conversionRate = 0;

  // Format price from Kobo to Naira
  const formatPrice = (priceInKobo: number) => {
    return `₦${(priceInKobo / 100).toLocaleString()}`;
  };

  // Empty state - no courses yet
  if (totalCount === 0) {
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
              {formatPrice(totalRevenue)}
            </span>
            <span className="text-xs text-secondary-text">vs last mo.</span>
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
              {totalStudents.toLocaleString()}
            </span>
            <span className="text-xs text-secondary-text">active users</span>
          </div>
        </div>

        {/* Avg Watch Time */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +0%
            </span>
          </div>
          <p className="text-xs text-secondary-text uppercase tracking-wider font-semibold">
            Avg Watch Time
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-primary-text">
              {avgWatchTime.minutes}m {avgWatchTime.seconds}s
            </span>
            <span className="text-xs text-secondary-text">per session</span>
          </div>
        </div>

        {/* Course Conversion */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +0%
            </span>
          </div>
          <p className="text-xs text-secondary-text uppercase tracking-wider font-semibold">
            Course Conversion
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-primary-text">
              {conversionRate}%
            </span>
            <span className="text-xs text-secondary-text">of leads</span>
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
              Chart data will appear when you have student enrollments
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

          {publishedCourses.length > 1 ? (
            <div className="space-y-4">
              {publishedCourses.slice(0, 4).map((course, index) => (
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
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>0.0</span>
                      <span className="text-secondary-text/50">(0)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-primary-text">
                      {formatPrice(course.price || 0)}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">
                      0%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-secondary-text text-sm">
                {publishedCourses.length === 0
                  ? "No published courses yet"
                  : "Publish more courses to see rankings"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Demographics */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-primary-text">
                Student Demographics
              </h3>
              <p className="text-sm text-secondary-text">
                Global distribution of learners
              </p>
            </div>
          </div>
          {/* Map Placeholder */}
          <div className="h-48 flex items-center justify-center bg-surface-muted/50 rounded-lg border border-dashed border-border">
            <p className="text-secondary-text text-sm">
              Demographics appear after student enrollments
            </p>
          </div>
        </div>

        {/* Retention Rate */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-primary-text">
                Retention Rate
              </h3>
              <p className="text-sm text-secondary-text">
                Monthly student cohort retention
              </p>
            </div>
            <span className="px-3 py-1 text-xs font-medium bg-surface-muted rounded-full text-secondary-text">
              Current Year
            </span>
          </div>
          {/* Chart Placeholder */}
          <div className="h-48 flex items-center justify-center bg-surface-muted/50 rounded-lg border border-dashed border-border">
            <p className="text-secondary-text text-sm">
              Retention data appears after student enrollments
            </p>
          </div>
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
