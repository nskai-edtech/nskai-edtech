import { MonthlyDataPoint } from "@/actions/analytics/types";
import { formatPrice } from "@/lib/format";
import { RevenueChart } from "./revenue-chart";
import { BarChart } from "./bar-chart";
import {
  DollarSign,
  Users,
  BookOpen,
  BrainCircuit,
  TrendingUp,
  UserPlus,
} from "lucide-react";

function KpiCard({
  label,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      <p className="text-xs text-secondary-text uppercase tracking-wider font-semibold">
        {label}
      </p>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-2xl font-bold text-primary-text">{value}</span>
        <span className="text-xs text-secondary-text">{subtitle}</span>
      </div>
    </div>
  );
}

export function KpiCards({
  totalRevenue,
  totalStudents,
  publishedCourses,
  totalCourses,
  avgQuizScore,
}: {
  totalRevenue: number;
  totalStudents: number;
  publishedCourses: number;
  totalCourses: number;
  avgQuizScore: number | null;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        label="Total Revenue"
        value={formatPrice(totalRevenue)}
        subtitle="lifetime"
        icon={DollarSign}
        iconBg="bg-blue-100 dark:bg-blue-900/30"
        iconColor="text-blue-600 dark:text-blue-400"
      />
      <KpiCard
        label="Total Students"
        value={totalStudents.toLocaleString()}
        subtitle="enrolled"
        icon={Users}
        iconBg="bg-cyan-100 dark:bg-cyan-900/30"
        iconColor="text-cyan-600 dark:text-cyan-400"
      />
      <KpiCard
        label="Published Courses"
        value={`${publishedCourses} / ${totalCourses}`}
        subtitle="courses"
        icon={BookOpen}
        iconBg="bg-amber-100 dark:bg-amber-900/30"
        iconColor="text-amber-600 dark:text-amber-400"
      />
      <KpiCard
        label="Avg Quiz Score"
        value={avgQuizScore !== null ? `${avgQuizScore}%` : "–"}
        subtitle={
          avgQuizScore !== null ? "across all quizzes" : "no quizzes yet"
        }
        icon={BrainCircuit}
        iconBg="bg-purple-100 dark:bg-purple-900/30"
        iconColor="text-purple-600 dark:text-purple-400"
      />
    </div>
  );
}

export function TrendCharts({
  revenueByMonth,
  enrollmentsByMonth,
}: {
  revenueByMonth: MonthlyDataPoint[];
  enrollmentsByMonth: MonthlyDataPoint[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-surface border border-border rounded-xl p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-secondary-text" />
          <h3 className="text-base font-semibold text-primary-text">
            Revenue Trend
          </h3>
        </div>
        <p className="text-sm text-secondary-text mb-4">
          Monthly revenue over the last 6 months
        </p>
        <div className="h-80 flex-1">
          <RevenueChart data={revenueByMonth} />
        </div>
      </div>

      <BarChart
        data={enrollmentsByMonth}
        title="New Enrollments"
        subtitle="Monthly student enrollments over 6 months"
        icon={UserPlus}
        barColor="bg-cyan-500 dark:bg-cyan-400"
        formatValue={(val) => val.toLocaleString()}
      />
    </div>
  );
}
