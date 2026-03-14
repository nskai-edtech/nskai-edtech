"use client";

import { useState } from "react";
import type { LiveSessionsFeedResponse } from "@/lib/live-sessions/types";
import { TutorSessionCard } from "./tutor-session-card";
import { ScheduleSessionModal } from "./schedule-session-modal";

type TutorLiveSessionsBoardProps = {
    initialData: LiveSessionsFeedResponse;
};

type SessionSectionProps = {
    title: string;
    description: string;
    emptyMessage: string;
    sessions: LiveSessionsFeedResponse["grouped"]["liveNow"];
    onSessionUpdated?: () => void;
};

function SessionSection({
    title,
    description,
    emptyMessage,
    sessions,
    onSessionUpdated,
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
                        <TutorSessionCard
                            key={session.id}
                            session={session}
                            onSessionUpdated={onSessionUpdated}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

export function TutorLiveSessionsBoard({
    initialData,
}: TutorLiveSessionsBoardProps) {
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [sessions] = useState(initialData);

    const handleSessionScheduled = () => {
        setScheduleModalOpen(false);
        // Refetch sessions
        window.location.reload();
    };

    const handleSessionUpdated = () => {
        // Refetch sessions
        window.location.reload();
    };

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
                            Schedule, manage, and monitor your live classroom sessions.
                            Viewers and engagement metrics are tracked in real-time.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                            Total: {sessions.grouped.liveNow.length + sessions.grouped.upcoming.length + sessions.grouped.past.length}
                        </span>
                        <button
                            type="button"
                            onClick={() => setScheduleModalOpen(true)}
                            className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                        >
                            + Schedule Session
                        </button>
                    </div>
                </div>
            </section>

            <SessionSection
                title="Live Now"
                description="Sessions currently in progress."
                emptyMessage="No sessions are live right now."
                sessions={sessions.grouped.liveNow}
                onSessionUpdated={handleSessionUpdated}
            />

            <SessionSection
                title="Upcoming"
                description="Sessions you've scheduled."
                emptyMessage="No upcoming sessions scheduled yet."
                sessions={sessions.grouped.upcoming}
                onSessionUpdated={handleSessionUpdated}
            />

            <SessionSection
                title="Past & Replays"
                description="Ended sessions with recordings."
                emptyMessage="No past sessions yet."
                sessions={sessions.grouped.past}
                onSessionUpdated={handleSessionUpdated}
            />

            <ScheduleSessionModal
                open={scheduleModalOpen}
                onOpenChange={setScheduleModalOpen}
                onSessionScheduled={handleSessionScheduled}
            />
        </div>
    );
}
