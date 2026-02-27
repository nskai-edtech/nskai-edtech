"use client";

import React, { useState } from "react";
import { HelpCircle, Trophy, Flame, Zap, X } from "lucide-react";

function PointRule({
  icon,
  label,
  xp,
  colour,
}: {
  icon: React.ReactNode;
  label: string;
  xp: number;
  colour: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${colour}`}
      >
        {icon}
      </div>
      <span className="text-sm font-medium text-primary-text">{label}</span>
      <span className="ml-auto text-sm font-bold text-brand">+{xp} XP</span>
    </div>
  );
}

function SummaryCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-bold text-primary-text">{title}</h3>
      {children}
    </div>
  );
}

/* ── main export  */

export function HowItWorksButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-brand/30 bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand/20"
      >
        <HelpCircle className="h-3.5 w-3.5" />
        How it works
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-md space-y-5 rounded-2xl border border-border bg-background p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* close button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 text-secondary-text hover:text-primary-text"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-bold text-primary-text">
              How XP &amp; Streaks Work
            </h2>

            {/* XP rules */}
            <SummaryCard title="Earning XP">
              <PointRule
                icon={<Trophy className="h-5 w-5 text-brand" />}
                label="Complete all lessons in a module"
                xp={10}
                colour="bg-brand/10"
              />
              <PointRule
                icon={<Zap className="h-5 w-5 text-yellow-500" />}
                label="Pass every quiz in a module"
                xp={25}
                colour="bg-yellow-500/10"
              />
              <PointRule
                icon={<Flame className="h-5 w-5 text-orange-500" />}
                label="Maintain a 7-day learning streak"
                xp={70}
                colour="bg-orange-500/10"
              />
            </SummaryCard>

            {/* Streak explanation */}
            <SummaryCard title="Streak Rules">
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-secondary-text">
                <li>
                  Watch at least{" "}
                  <span className="font-semibold text-primary-text">
                    30 minutes
                  </span>{" "}
                  of video in a single day to count that day toward your streak.
                </li>
                <li>Your streak resets if you miss a day.</li>
                <li>
                  Every{" "}
                  <span className="font-semibold text-primary-text">
                    7 consecutive days
                  </span>{" "}
                  earns a bonus of{" "}
                  <span className="font-semibold text-brand">70 XP</span>.
                </li>
              </ul>
            </SummaryCard>

            <button
              onClick={() => setOpen(false)}
              className="w-full rounded-xl bg-brand py-2.5 text-sm font-bold text-white transition hover:bg-brand/90"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
