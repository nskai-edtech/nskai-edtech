import { format } from "date-fns";

import type { LiveSessionListItem } from "@/lib/live-sessions/types";

import { SessionStatusBadge } from "./session-status-badge";

type SessionCardProps = {
    session: LiveSessionListItem;
};

function getAction(session: LiveSessionListItem) {
    if (session.status === "LIVE" && session.canJoin) {
        return {
            label: "Join live session",
            href: `/learner/live-sessions/${session.id}`,
        };
    }

    if (session.status === "ENDED" && session.canReplay) {
        return {
            label: "Watch replay",
            href: `/learner/live-sessions/${session.id}`,
        };
    }

    return null;
}

export function SessionCard({ session }: SessionCardProps) {
    const action = getAction(session);

    return (
        <article className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div className="space-y-2">
                    <SessionStatusBadge status={session.status} />
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {session.title}
                    </h3>
                    {session.description ? (
                        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                            {session.description}
                        </p>
                    ) : null}
                </div>
            </div>

            <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-800/70">
                    <dt className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        Hosted by
                    </dt>
                    <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                        {session.hostDisplayName} ({session.hostRole})
                    </dd>
                </div>

                <div className="rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-800/70">
                    <dt className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        Starts
                    </dt>
                    <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                        {format(new Date(session.startsAt), "PPP p")}
                    </dd>
                </div>

                <div className="rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-800/70">
                    <dt className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        Viewers
                    </dt>
                    <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                        {session.activeViewerCount}
                    </dd>
                </div>

                <div className="rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-800/70">
                    <dt className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        Channel
                    </dt>
                    <dd className="truncate font-mono text-xs text-zinc-700 dark:text-zinc-300">
                        {session.channelName}
                    </dd>
                </div>
            </dl>

            {action ? (
                <div className="mt-5">
                    <a
                        href={action.href}
                        className="inline-flex items-center rounded-2xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    >
                        {action.label}
                    </a>
                </div>
            ) : null}
        </article>
    );
}