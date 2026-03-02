import { Clock, BrainCircuit, Zap, Users } from "lucide-react";
import type { PlatformEngagement } from "@/actions/analytics/types";

function EngagementCard({
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

export function EngagementSummary({
  engagement,
}: {
  engagement: PlatformEngagement;
}) {
  const watchHours = Math.round(engagement.totalWatchMinutes / 60);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <EngagementCard
        label="Watch Time"
        value={watchHours > 0 ? `${watchHours.toLocaleString()}h` : "0h"}
        subtitle="last 30 days"
        icon={Clock}
        iconBg="bg-indigo-100 dark:bg-indigo-900/30"
        iconColor="text-indigo-600 dark:text-indigo-400"
      />
      <EngagementCard
        label="Quiz Attempts"
        value={engagement.totalQuizAttempts.toLocaleString()}
        subtitle="last 30 days"
        icon={BrainCircuit}
        iconBg="bg-purple-100 dark:bg-purple-900/30"
        iconColor="text-purple-600 dark:text-purple-400"
      />
      <EngagementCard
        label="Points Earned"
        value={engagement.totalPointsEarned.toLocaleString()}
        subtitle="last 30 days"
        icon={Zap}
        iconBg="bg-amber-100 dark:bg-amber-900/30"
        iconColor="text-amber-600 dark:text-amber-400"
      />
      <EngagementCard
        label="Active Learners"
        value={engagement.activeLearnersLast30d.toLocaleString()}
        subtitle="last 30 days"
        icon={Users}
        iconBg="bg-green-100 dark:bg-green-900/30"
        iconColor="text-green-600 dark:text-green-400"
      />
    </div>
  );
}
