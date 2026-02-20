import { type MonthlyDataPoint } from "@/actions/analytics";
import { formatPrice } from "@/lib/format";
import {
  DollarSign,
  Users,
  BookOpen,
  BrainCircuit,
  TrendingUp,
  UserPlus,
} from "lucide-react";

// ─── KPI Card ───────────────────────────────────────────────────────────────

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

// ─── Exported Section ───────────────────────────────────────────────────────

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

// ─── Charts Section ────────────────────────────────────────────────────────

function BarChart({
  data,
  title,
  subtitle,
  icon: Icon,
  barColor,
  formatValue,
}: {
  data: MonthlyDataPoint[];
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  barColor: string;
  formatValue: (val: number) => string;
}) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Icon className="w-4 h-4 text-secondary-text" />
            <h3 className="text-base font-semibold text-primary-text">
              {title}
            </h3>
          </div>
          <p className="text-sm text-secondary-text">{subtitle}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-primary-text">
            {formatValue(data.reduce((sum, d) => sum + d.value, 0))}
          </p>
          <p className="text-xs text-secondary-text">6-month total</p>
        </div>
      </div>

      <div className="flex items-end gap-3 h-36">
        {data.map((point, idx) => {
          const heightPercent = maxVal > 0 ? (point.value / maxVal) * 100 : 0;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-[10px] font-medium text-secondary-text tabular-nums">
                {point.value > 0 ? formatValue(point.value) : "–"}
              </span>
              <div className="w-full flex items-end h-24">
                <div
                  className={`w-full rounded-t-md transition-all ${barColor}`}
                  style={{
                    height: `${Math.max(heightPercent, 4)}%`,
                    minHeight: "3px",
                    opacity: point.value === 0 ? 0.2 : 1,
                  }}
                />
              </div>
              <span className="text-[11px] font-medium text-secondary-text">
                {point.month}
              </span>
            </div>
          );
        })}
      </div>
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
      <BarChart
        data={revenueByMonth}
        title="Revenue Trend"
        subtitle="Monthly revenue over the last 6 months"
        icon={TrendingUp}
        barColor="bg-blue-500 dark:bg-blue-400"
        formatValue={(val) => formatPrice(val)}
      />
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
