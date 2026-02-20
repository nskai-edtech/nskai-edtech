import { getTutorAnalytics } from "@/actions/analytics";
import { KpiCards, TrendCharts } from "@/components/analytics/kpi-and-charts";
import { CoursePerformanceTable } from "@/components/analytics/course-performance-table";
import {
  RecentEnrollmentsFeed,
  QuizPerformancePanel,
} from "@/components/analytics/activity-panels";

export default async function AnalyticsPage() {
  const analytics = await getTutorAnalytics();

  if ("error" in analytics) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-900">
          Error: {analytics.error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary-text">Analytics</h1>
        <p className="text-secondary-text mt-1">
          Track performance, revenue, engagement, and quiz scores across all
          your courses.
        </p>
      </div>

      {/* KPI Cards */}
      <KpiCards
        totalRevenue={analytics.totalRevenue}
        totalStudents={analytics.totalStudents}
        publishedCourses={analytics.publishedCourses}
        totalCourses={analytics.totalCourses}
        avgQuizScore={analytics.avgQuizScore}
      />

      {/* Revenue & Enrollment Charts */}
      <TrendCharts
        revenueByMonth={analytics.revenueByMonth}
        enrollmentsByMonth={analytics.enrollmentsByMonth}
      />

      {/* Course Performance Table */}
      <CoursePerformanceTable courses={analytics.courses} />

      {/* Recent Enrollments + Quiz Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentEnrollmentsFeed enrollments={analytics.recentEnrollments} />
        <QuizPerformancePanel quizzes={analytics.quizPerformance} />
      </div>
    </div>
  );
}
