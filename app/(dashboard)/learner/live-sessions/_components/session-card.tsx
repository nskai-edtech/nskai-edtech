"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Users, Clock, PlayCircle, VideoOff, Radio } from "lucide-react";

import type { LiveSessionListItem } from "@/lib/live-sessions/types";

import { SessionStatusBadge } from "./session-status-badge";

type SessionCardProps = {
    session: LiveSessionListItem;
};

/** Format a millisecond diff → "45m 12s", "1h 23m", "48s" */
function formatDuration(startedAt: string | null, endedAt: string | null): string | null {
    if (!startedAt || !endedAt) return null;
    const diffMs = new Date(endedAt).getTime() - new Date(startedAt).getTime();
    if (diffMs <= 0) return null;
    const totalSecs = Math.floor(diffMs / 1_000);
    const h = Math.floor(totalSecs / 3_600);
    const m = Math.floor((totalSecs % 3_600) / 60);
    const s = totalSecs % 60;
    if (h > 0) return m > 0 ? `${h}h ${m}m` : `${h}h`;
    if (m > 0) return s > 0 ? `${m}m ${s}s` : `${m}m`;
    return `${s}s`;
}

function getAction(session: LiveSessionListItem) {
    if (session.status === "LIVE" && session.canJoin) {
        return { label: "Join live session", href: `/learner/live-sessions/${session.id}` };
    }
    if (session.status === "ENDED" && session.canReplay) {
        return { label: "Watch replay", href: `/learner/live-sessions/${session.id}` };
    }
    return null;
}

/**
 * Renders a locale/timezone-aware date string only after mount to avoid
 * SSR↔client hydration mismatches caused by server/client timezone differences.
 */
function ClientDate({ isoStr }: { isoStr: string }) {
    const [text, setText] = useState<string>("—");

    useEffect(() => {
        setText(format(new Date(isoStr), "PPP p"));
    }, [isoStr]);

    return <>{text}</>;
}

/** Stat cell used in the dl grid */
function StatCell({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-800/70">
            <dt className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {label}
            </dt>
            <dd className="font-medium text-zinc-900 dark:text-zinc-100">{children}</dd>
        </div>
    );
}

export function SessionCard({ session }: SessionCardProps) {
    const action = getAction(session);
    const isLive = session.status === "LIVE";
    const isEnded = session.status === "ENDED";
    const duration = formatDuration(session.actualStartedAt, session.actualEndedAt);

    return (
        <article className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
            {/* ── Header ──────────────────────────────────── */}
            <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-2">
                    <SessionStatusBadge status={session.status} />
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {session.title}
                    </h3>
                    {session.description ? (
                        <p className="line-clamp-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                            {session.description}
                        </p>
                    ) : null}
                </div>
            </div>

            {/* ── Stats grid ──────────────────────────────── */}
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <StatCell label="Hosted by">
                    {session.hostDisplayName}
                </StatCell>

                {/* Date row — label changes by status */}
                <StatCell label={isEnded ? "Started" : "Scheduled for"}>
                    <ClientDate isoStr={session.actualStartedAt ?? session.startsAt} />
                </StatCell>

                {/* Viewers — active count for LIVE, total attendees for ENDED */}
                <StatCell label={isLive ? "Watching now" : "Total viewers"}>
                    <span className="flex items-center gap-1.5">
                        <Users size={14} className={isLive ? "text-red-500" : "text-zinc-400"} />
                        {session.activeViewerCount}
                        {isLive && (
                            <span className="ml-1 inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                        )}
                    </span>
                </StatCell>

                {/* Status-specific fourth cell */}
                {isEnded ? (
                    <StatCell label="Duration">
                        <span className="flex items-center gap-1.5">
                            <Clock size={14} className="text-zinc-400" />
                            {duration ?? "—"}
                        </span>
                    </StatCell>
                ) : (
                    <StatCell label="Channel">
                        <span className="truncate font-mono text-xs text-zinc-700 dark:text-zinc-300">
                            {session.channelName}
                        </span>
                    </StatCell>
                )}
            </dl>

            {/* ── Recording badge (ended sessions only) ───── */}
            {isEnded && (
                <div className="mt-3 flex items-center gap-2">
                    {session.canReplay ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                            <PlayCircle size={12} />
                            Recording available
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                            <VideoOff size={12} />
                            No recording
                        </span>
                    )}
                </div>
            )}

            {/* ── Action button ────────────────────────────── */}
            {action ? (
                <div className="mt-5">
                    <a
                        href={action.href}
                        className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 ${
                            isLive
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-zinc-800 dark:bg-zinc-700"
                        }`}
                    >
                        {isLive ? (
                            <>
                                <Radio size={14} className="animate-pulse" />
                                {action.label}
                            </>
                        ) : (
                            <>
                                <PlayCircle size={14} />
                                {action.label}
                            </>
                        )}
                    </a>
                </div>
            ) : null}
        </article>
    );
}
