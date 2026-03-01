import type { ActivityEvent } from "@/actions/gamification/xp-breakdown";
import type { PointReason } from "@/actions/gamification/types";

const DOT_COLORS: Record<PointReason, string> = {
  LESSON_COMPLETED: "bg-brand",
  QUIZ_PASSED: "bg-yellow-500",
  MODULE_COMPLETED: "bg-emerald-500",
  MODULE_QUIZZES_PASSED: "bg-purple-500",
  STREAK_7_DAYS: "bg-orange-500",
};

const BADGE_COLORS: Record<PointReason, string> = {
  LESSON_COMPLETED: "bg-brand/10 text-brand",
  QUIZ_PASSED: "bg-yellow-500/10 text-yellow-500",
  MODULE_COMPLETED: "bg-emerald-500/10 text-emerald-500",
  MODULE_QUIZZES_PASSED: "bg-purple-500/10 text-purple-500",
  STREAK_7_DAYS: "bg-orange-500/10 text-orange-500",
};

function timeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function XpActivityTimeline({
  events,
}: {
  events: ActivityEvent[];
}) {
  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="text-sm text-secondary-text">
          No XP activity yet. Complete lessons and quizzes to start earning!
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface divide-y divide-border">
      {events.map((event) => (
        <div
          key={event.id}
          className="flex items-center gap-3 px-4 py-3"
        >
          {/* Dot */}
          <div
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${DOT_COLORS[event.reason]}`}
          />

          {/* Label */}
          <p className="min-w-0 flex-1 truncate text-sm text-primary-text">
            {event.label}
          </p>

          {/* XP badge */}
          <span
            className={`shrink-0 rounded-lg px-2 py-0.5 text-xs font-bold ${BADGE_COLORS[event.reason]}`}
          >
            +{event.amount} XP
          </span>

          {/* Time */}
          <span className="shrink-0 text-xs text-secondary-text w-16 text-right">
            {timeAgo(event.createdAt)}
          </span>
        </div>
      ))}
    </div>
  );
}
