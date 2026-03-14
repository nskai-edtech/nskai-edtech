import clsx from "clsx";

import type { LiveSessionStatus } from "@/lib/live-sessions/types";

type SessionStatusBadgeProps = {
    status: LiveSessionStatus;
};

const statusStyles: Record<LiveSessionStatus, string> = {
    SCHEDULED:
        "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    LIVE: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    ENDED:
        "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    CANCELLED:
        "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
};

export function SessionStatusBadge({
    status,
}: SessionStatusBadgeProps) {
    return (
        <span
            className={clsx(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide",
                statusStyles[status],
            )}
        >
            {status}
        </span>
    );
}