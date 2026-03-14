"use client";

import { useLiveSessionsFeed } from "@/hooks/use-live-sessions-feed";
import type { LiveSessionsFeedResponse } from "@/lib/live-sessions/types";

import { SessionCard } from "./session-card";

type LiveSessionsBoardProps = {
    initialData: LiveSessionsFeedResponse;
};

type SessionSectionProps = {
    title: string;
    description: string;
    emptyMessage: string;
    sessions: LiveSessionsFeedResponse["grouped"]["liveNow"];
};

function SessionSection({
    title,
    description,
    emptyMessage,
    sessions,
}: SessionSectionProps) {
    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                    {title}
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {description}
                </p>
            </div>

            {sessions.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
                    {emptyMessage}
                </div>
            ) : (
                <div className="grid gap-4">
                    {sessions.map((session) => (
                        <SessionCard key={session.id} session={session} />
                    ))}
                </div>
            )}
        </section>
    );
}

export function LiveSessionsBoard({
    initialData,
}: LiveSessionsBoardProps) {
    const {
        data,
        summary,
        isPollingRefresh,
        isSocketConnected,
        refresh,
    } = useLiveSessionsFeed({
        initialData,
    });

    return (
        <div className="space-y-8">
            <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                            Live classroom
                        </p>
                        <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-100">
                            Live Sessions
                        </h1>
                        <p className="max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                            Join sessions hosted by tutors and organization admins,
                            then come back here later for replays.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                            Socket: {isSocketConnected ? "Connected" : "Offline"}
                        </span>
                        <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                            Live: {summary.totalLive}
                        </span>
                        <button
                            type="button"
                            onClick={() => void refresh()}
                            className="rounded-2xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                            {isPollingRefresh ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>
                </div>
            </section>

            <SessionSection
                title="Live Now"
                description="These sessions are currently in progress."
                emptyMessage="No session is live right now."
                sessions={data.grouped.liveNow}
            />

            <SessionSection
                title="Upcoming"
                description="Scheduled sessions that learners can prepare for."
                emptyMessage="No upcoming sessions have been scheduled yet."
                sessions={data.grouped.upcoming}
            />

            <SessionSection
                title="Past & Replays"
                description="Ended sessions and available replays."
                emptyMessage="No past sessions yet."
                sessions={data.grouped.past}
            />
        </div>
    );
}