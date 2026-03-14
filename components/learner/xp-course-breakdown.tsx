"use client";

import { useState } from "react";
import { ChevronDown, BookOpen, Zap, Trophy, Award, Flame } from "lucide-react";
import Image from "next/image";
import type { CourseXpBreakdown } from "@/actions/gamification/xp-breakdown";
import type { PointReason } from "@/actions/gamification/types";

const REASON_META: Record<
  PointReason,
  { label: string; icon: typeof BookOpen; color: string }
> = {
  LESSON_COMPLETED: {
    label: "Lessons",
    icon: BookOpen,
    color: "text-brand",
  },
  QUIZ_PASSED: {
    label: "Quizzes",
    icon: Zap,
    color: "text-yellow-500",
  },
  MODULE_COMPLETED: {
    label: "Module completions",
    icon: Trophy,
    color: "text-emerald-500",
  },
  MODULE_QUIZZES_PASSED: {
    label: "Module quiz mastery",
    icon: Award,
    color: "text-purple-500",
  },
  STREAK_7_DAYS: {
    label: "Streak bonuses",
    icon: Flame,
    color: "text-orange-500",
  },
  DIAGNOSTIC_COMPLETED: {
    label: "Diagnostic assessments",
    icon: BookOpen,
    color: "text-sky-500",
  },
  SKILL_MASTERED: {
    label: "Skills mastered",
    icon: Award,
    color: "text-indigo-500",
  },
};

function CourseCard({ course }: { course: CourseXpBreakdown }) {
  const [open, setOpen] = useState(false);
  const isStreak = course.courseId === null;

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      {/* Collapsed header */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-background/50"
      >
        {/* Thumbnail or icon */}
        {isStreak ? (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
            <Flame className="h-6 w-6 text-orange-500" />
          </div>
        ) : course.courseImage ? (
          <Image
            src={course.courseImage}
            alt={course.courseTitle}
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/10">
            <BookOpen className="h-6 w-6 text-brand" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-primary-text">
            {course.courseTitle}
          </p>
          <p className="text-xs text-secondary-text">
            {course.items.length} earning{" "}
            {course.items.length === 1 ? "type" : "types"}
          </p>
        </div>

        <span className="text-sm font-bold text-brand whitespace-nowrap">
          +{course.totalXp.toLocaleString()} XP
        </span>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-secondary-text transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-2">
          {course.items.map((item) => {
            const meta = REASON_META[item.reason];
            const Icon = meta.icon;
            return (
              <div
                key={item.reason}
                className="flex items-center gap-3 rounded-xl bg-background p-3"
              >
                <Icon className={`h-4 w-4 shrink-0 ${meta.color}`} />
                <span className="text-sm text-primary-text flex-1">
                  {meta.label}
                </span>
                <span className="text-xs text-secondary-text mr-2">
                  ×{item.count}
                </span>
                <span className={`text-sm font-bold ${meta.color}`}>
                  +{item.totalXp.toLocaleString()} XP
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function XpCourseBreakdown({
  courses,
}: {
  courses: CourseXpBreakdown[];
}) {
  if (courses.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="text-sm text-secondary-text">
          No course-level XP earned yet. Start learning to see your breakdown!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {courses.map((course) => (
        <CourseCard key={course.courseId ?? "__streaks__"} course={course} />
      ))}
    </div>
  );
}
