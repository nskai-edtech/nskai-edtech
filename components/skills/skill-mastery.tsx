"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";
import type { UserSkillProfile } from "@/actions/skills/types";

// ─── Single Skill Mastery Card ───
export function SkillMasteryCard({ skill }: { skill: UserSkillProfile }) {
  const level =
    skill.masteryScore >= 80
      ? "mastered"
      : skill.masteryScore >= 50
        ? "intermediate"
        : "weak";

  const colors = {
    mastered: {
      bar: "bg-green-500",
      text: "text-green-600 dark:text-green-400",
      bg: "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20",
    },
    intermediate: {
      bar: "bg-amber-500",
      text: "text-amber-600 dark:text-amber-400",
      bg: "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20",
    },
    weak: {
      bar: "bg-red-500",
      text: "text-red-600 dark:text-red-400",
      bg: "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20",
    },
  };

  const style = colors[level];

  return (
    <div className={cn("border rounded-xl p-4 transition-colors", style.bg)}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-medium text-primary-text text-sm">
            {skill.skillTitle}
          </h4>
          <p className="text-xs text-secondary-text">{skill.skillCategory}</p>
        </div>
        {level === "mastered" ? (
          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
        ) : level === "intermediate" ? (
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
        ) : (
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-surface-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              style.bar,
            )}
            style={{ width: `${skill.masteryScore}%` }}
          />
        </div>
        <span className={cn("text-sm font-semibold", style.text)}>
          {skill.masteryScore}%
        </span>
      </div>
      {skill.lastAssessedAt && (
        <div className="flex items-center gap-1 mt-2 text-xs text-secondary-text">
          <Clock className="w-3 h-3" />
          <span>
            Last assessed{" "}
            {new Date(skill.lastAssessedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Skill Profile (Grouped by Category) ───
export function SkillProfile({ skills }: { skills: UserSkillProfile[] }) {
  // Group by category
  const grouped = skills.reduce(
    (acc, skill) => {
      if (!acc[skill.skillCategory]) {
        acc[skill.skillCategory] = [];
      }
      acc[skill.skillCategory].push(skill);
      return acc;
    },
    {} as Record<string, UserSkillProfile[]>,
  );

  if (skills.length === 0) {
    return (
      <div className="text-center py-12 bg-surface border border-border rounded-2xl">
        <AlertCircle className="w-10 h-10 text-secondary-text mx-auto mb-3" />
        <p className="text-primary-text font-medium">No skills assessed yet</p>
        <p className="text-sm text-secondary-text mt-1">
          Take a diagnostic assessment to discover your strengths and areas for
          improvement.
        </p>
      </div>
    );
  }

  const avgMastery = Math.round(
    skills.reduce((sum, s) => sum + s.masteryScore, 0) / skills.length,
  );

  const mastered = skills.filter((s) => s.masteryScore >= 80).length;
  const weak = skills.filter((s) => s.masteryScore < 50).length;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary-text">{avgMastery}%</p>
          <p className="text-xs text-secondary-text mt-1">Avg Mastery</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {mastered}
          </p>
          <p className="text-xs text-secondary-text mt-1">Skills Mastered</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {weak}
          </p>
          <p className="text-xs text-secondary-text mt-1">Needs Work</p>
        </div>
      </div>

      {/* Grouped Skills */}
      {Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([category, categorySkills]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-secondary-text uppercase tracking-wider mb-3">
              {category}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categorySkills
                .sort((a, b) => a.masteryScore - b.masteryScore)
                .map((skill) => (
                  <SkillMasteryCard key={skill.id} skill={skill} />
                ))}
            </div>
          </div>
        ))}
    </div>
  );
}

// ─── Compact Skill Summary Widget (for dashboard) ───
export function SkillSummaryWidget({ skills }: { skills: UserSkillProfile[] }) {
  if (skills.length === 0) return null;

  const sorted = [...skills].sort((a, b) => a.masteryScore - b.masteryScore);
  const weakest = sorted.slice(0, 3);
  const strongest = sorted.slice(-3).reverse();

  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <h3 className="font-semibold text-primary-text mb-4">Skills Overview</h3>

      {weakest.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-secondary-text uppercase tracking-wider mb-2">
            Needs Improvement
          </p>
          <div className="space-y-2">
            {weakest.map((s) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className="flex-1 text-sm text-primary-text truncate">
                  {s.skillTitle}
                </div>
                <div className="w-16 h-1.5 bg-surface-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      s.masteryScore >= 50 ? "bg-amber-500" : "bg-red-500",
                    )}
                    style={{ width: `${s.masteryScore}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-secondary-text w-8 text-right">
                  {s.masteryScore}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {strongest.length > 0 && strongest[0].masteryScore >= 50 && (
        <div>
          <p className="text-xs font-medium text-secondary-text uppercase tracking-wider mb-2">
            Strongest
          </p>
          <div className="space-y-2">
            {strongest
              .filter((s) => s.masteryScore >= 50)
              .map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div className="flex-1 text-sm text-primary-text truncate">
                    {s.skillTitle}
                  </div>
                  <div className="w-16 h-1.5 bg-surface-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${s.masteryScore}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-secondary-text w-8 text-right">
                    {s.masteryScore}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
