import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Zap,
  Trophy,
  Award,
  Flame,
  Loader2,
  Star,
} from "lucide-react";
import {
  getXpBreakdown,
  type TimeRange,
  type CategorySummary,
} from "@/actions/gamification/xp-breakdown";
import type { PointReason } from "@/actions/gamification/types";
import { XpTimeFilter } from "@/components/learner/xp-time-filter";
import { XpCourseBreakdown } from "@/components/learner/xp-course-breakdown";
import { XpActivityTimeline } from "@/components/learner/xp-activity-timeline";

/* ── Category card meta ──────────────────────────── */

const CATEGORY_META: Record<
  PointReason,
  {
    label: string;
    sublabel: string;
    icon: typeof BookOpen;
    gradient: string;
    iconBg: string;
    iconColor: string;
    xpPer: number;
  }
> = {
  LESSON_COMPLETED: {
    label: "Lessons",
    sublabel: "lesson",
    icon: BookOpen,
    gradient: "from-brand/10 to-transparent border-brand/20",
    iconBg: "bg-brand/10",
    iconColor: "text-brand",
    xpPer: 2,
  },
  QUIZ_PASSED: {
    label: "Quizzes",
    sublabel: "quiz",
    icon: Zap,
    gradient: "from-yellow-500/10 to-transparent border-yellow-500/20",
    iconBg: "bg-yellow-500/10",
    iconColor: "text-yellow-500",
    xpPer: 5,
  },
  MODULE_COMPLETED: {
    label: "Modules",
    sublabel: "module",
    icon: Trophy,
    gradient: "from-emerald-500/10 to-transparent border-emerald-500/20",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    xpPer: 10,
  },
  MODULE_QUIZZES_PASSED: {
    label: "Quiz Mastery",
    sublabel: "module",
    icon: Award,
    gradient: "from-purple-500/10 to-transparent border-purple-500/20",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
    xpPer: 25,
  },
  STREAK_7_DAYS: {
    label: "Streaks",
    sublabel: "streak",
    icon: Flame,
    gradient: "from-orange-500/10 to-transparent border-orange-500/20",
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-500",
    xpPer: 70,
  },
  DIAGNOSTIC_COMPLETED: {
    label: "Diagnostics",
    sublabel: "diagnostic",
    icon: Star,
    gradient: "from-sky-500/10 to-transparent border-sky-500/20",
    iconBg: "bg-sky-500/10",
    iconColor: "text-sky-500",
    xpPer: 5,
  },
  SKILL_MASTERED: {
    label: "Skills Mastered",
    sublabel: "skill",
    icon: Award,
    gradient: "from-indigo-500/10 to-transparent border-indigo-500/20",
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-500",
    xpPer: 50,
  },
};

const ALL_REASONS: PointReason[] = [
  "LESSON_COMPLETED",
  "QUIZ_PASSED",
  "MODULE_COMPLETED",
  "MODULE_QUIZZES_PASSED",
  "STREAK_7_DAYS",
];

/* ── Page  */

export default function XpBreakdownPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Suspense fallback={<PageSkeleton />}>
        <XpBreakdownContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="flex justify-center items-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-brand" />
    </div>
  );
}

async function XpBreakdownContent({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const params = await searchParams;
  const range = (params.range as TimeRange) || "all";
  const result = await getXpBreakdown(range);

  if ("error" in result) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <p className="text-red-500">{result.error}</p>
      </div>
    );
  }

  const { totalXp, categories, byCourse, recentActivity } = result;

  // Build a lookup so we can fill in zeros for missing categories
  const catMap = new Map<PointReason, CategorySummary>();
  for (const c of categories) catMap.set(c.reason, c);

  return (
    <>
      {/* Breadcrumb + Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/learner/profile"
            className="flex items-center gap-1.5 text-sm font-medium text-secondary-text hover:text-primary-text transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Profile
          </Link>
          <span className="text-secondary-text">/</span>
          <h1 className="text-xl font-bold text-primary-text">XP Breakdown</h1>
        </div>
        <XpTimeFilter />
      </div>

      {/* Hero Total */}
      <div className="rounded-2xl border border-brand/20 bg-linear-to-br from-brand/10 to-transparent p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-brand uppercase tracking-wider mb-1">
              {range === "week"
                ? "XP This Week"
                : range === "month"
                  ? "XP This Month"
                  : "Total XP Earned"}
            </p>
            <p className="text-5xl font-black text-primary-text">
              {totalXp.toLocaleString()}
            </p>
            <p className="text-sm text-secondary-text mt-2 font-medium">
              From {categories.reduce((s, c) => s + c.count, 0)} earning events
            </p>
          </div>
          <div className="w-16 h-16 rounded-full bg-brand/10 text-brand flex items-center justify-center border border-brand/20 shadow-sm">
            <Star className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Category Summary Cards */}
      <div>
        <h2 className="text-lg font-bold text-primary-text mb-4">
          By Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {ALL_REASONS.map((reason) => {
            const meta = CATEGORY_META[reason];
            const data = catMap.get(reason);
            const count = data?.count ?? 0;
            const xp = data?.totalXp ?? 0;
            const Icon = meta.icon;
            return (
              <div
                key={reason}
                className={`rounded-2xl border bg-linear-to-br ${meta.gradient} p-4 space-y-3`}
              >
                <div
                  className={`h-10 w-10 rounded-full ${meta.iconBg} flex items-center justify-center`}
                >
                  <Icon className={`h-5 w-5 ${meta.iconColor}`} />
                </div>
                <div>
                  <p className="text-xs font-bold text-secondary-text uppercase tracking-wider">
                    {meta.label}
                  </p>
                  <p className="text-2xl font-black text-primary-text mt-0.5">
                    +{xp.toLocaleString()}
                  </p>
                  <p className="text-xs text-secondary-text mt-1">
                    {count} {meta.sublabel}
                    {count !== 1 ? "s" : ""} × {meta.xpPer} XP
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* By Course Breakdown */}
      <div>
        <h2 className="text-lg font-bold text-primary-text mb-4">By Course</h2>
        <XpCourseBreakdown courses={byCourse} />
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-bold text-primary-text mb-4">
          Recent Activity
        </h2>
        <XpActivityTimeline events={recentActivity} />
      </div>
    </>
  );
}
