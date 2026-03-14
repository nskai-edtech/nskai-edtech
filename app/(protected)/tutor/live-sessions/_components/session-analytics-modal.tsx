"use client";

interface SessionAnalyticsData {
    sessionId: string;
    title: string;
    status: string;
    totalViewers: number;
    uniqueViewers: number;
    durationMinutes: number;
    durationSeconds: number;
    avgSessionDuration: number;
}

interface SessionAnalyticsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: SessionAnalyticsData | null;
}

export function SessionAnalyticsModal({
    open,
    onOpenChange,
    data,
}: SessionAnalyticsModalProps) {
    if (!open || !data) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-zinc-900">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    Session Analytics
                </h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {data.title}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">
                            Total Viewers
                        </p>
                        <p className="mt-2 text-2xl font-bold text-blue-900 dark:text-blue-100">
                            {data.totalViewers}
                        </p>
                    </div>

                    <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
                        <p className="text-xs font-semibold uppercase tracking-wide text-green-600 dark:text-green-300">
                            Unique Viewers
                        </p>
                        <p className="mt-2 text-2xl font-bold text-green-900 dark:text-green-100">
                            {data.uniqueViewers}
                        </p>
                    </div>

                    <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-950">
                        <p className="text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-300">
                            Duration
                        </p>
                        <p className="mt-2 text-2xl font-bold text-purple-900 dark:text-purple-100">
                            {data.durationMinutes > 0
                                ? `${data.durationMinutes}m ${data.durationSeconds}s`
                                : `${data.durationSeconds}s`}
                        </p>
                    </div>

                    <div className="rounded-lg bg-orange-50 p-4 dark:bg-orange-950">
                        <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-300">
                            Avg Watch Time
                        </p>
                        <p className="mt-2 text-2xl font-bold text-orange-900 dark:text-orange-100">
                            {data.avgSessionDuration}m
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
