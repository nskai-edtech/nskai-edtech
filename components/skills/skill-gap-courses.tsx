"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SkillGap } from "@/actions/skills/types";

export function SkillGapCourses({ gaps }: { gaps: SkillGap[] }) {
  const gapsWithCourses = gaps.filter((g) => g.courses.length > 0);

  if (gapsWithCourses.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary-text">
          Recommended For Your Skill Gaps
        </h3>
      </div>

      <div className="space-y-3">
        {gapsWithCourses.map((gap) => (
          <div
            key={gap.skillId}
            className="bg-surface border border-border rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  gap.masteryScore < 30 ? "bg-red-500" : "bg-amber-500",
                )}
              />
              <span className="text-sm font-medium text-primary-text">
                {gap.skillTitle}
              </span>
              <span className="text-xs text-secondary-text">
                ({gap.masteryScore}% mastery)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {gap.courses.map((course) => (
                <Link
                  key={course.courseId}
                  href={`/learner/${course.courseId}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-muted transition-colors group"
                >
                  {course.courseImageUrl ? (
                    <Image
                      src={course.courseImageUrl}
                      alt={course.courseTitle}
                      width={48}
                      height={36}
                      className="rounded-md object-cover w-12 h-9"
                    />
                  ) : (
                    <div className="w-12 h-9 rounded-md bg-surface-muted flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-secondary-text" />
                    </div>
                  )}
                  <span className="text-sm text-primary-text group-hover:text-brand transition-colors truncate flex-1">
                    {course.courseTitle}
                  </span>
                  <ArrowRight className="w-3 h-3 text-secondary-text group-hover:text-brand shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
