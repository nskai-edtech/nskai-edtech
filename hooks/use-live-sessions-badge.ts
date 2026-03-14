"use client";

import { useCallback, useEffect, useState } from "react";

import { LIVE_SESSIONS_POLL_INTERVAL_MS } from "@/lib/live-sessions/events";
import type { LiveSessionsFeedResponse } from "@/lib/live-sessions/types";

type LiveSessionsBadgeCounts = {
    liveCount: number;
    scheduledCount: number;
    totalCount: number;
};

export function useLiveSessionsBadge(
    apiUrl = "/api/live-sessions",
    pollIntervalMs = LIVE_SESSIONS_POLL_INTERVAL_MS,
): LiveSessionsBadgeCounts {
    const [counts, setCounts] = useState<LiveSessionsBadgeCounts>({
        liveCount: 0,
        scheduledCount: 0,
        totalCount: 0,
    });

    const fetchCounts = useCallback(async () => {
        try {
            const response = await fetch(apiUrl, { cache: "no-store" });
            if (!response.ok) return;
            const data = (await response.json()) as LiveSessionsFeedResponse;
            const liveCount = data.grouped.liveNow.length;
            const scheduledCount = data.grouped.upcoming.length;
            setCounts({
                liveCount,
                scheduledCount,
                totalCount: liveCount + scheduledCount,
            });
        } catch {
            // silently ignore fetch errors
        }
    }, [apiUrl]);

    useEffect(() => {
        void fetchCounts();
        const interval = window.setInterval(
            () => void fetchCounts(),
            pollIntervalMs,
        );
        return () => window.clearInterval(interval);
    }, [fetchCounts, pollIntervalMs]);

    return counts;
}
