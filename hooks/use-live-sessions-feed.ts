"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { LIVE_SESSIONS_POLL_INTERVAL_MS } from "@/lib/live-sessions/events";
import { groupLiveSessions } from "@/lib/live-sessions/group-live-sessions";
import type {
    GroupedLiveSessions,
    LiveSessionListItem,
    LiveSessionsFeedResponse,
    LiveSessionWsEvent,
} from "@/lib/live-sessions/types";

type UseLiveSessionsFeedOptions = {
    initialData: LiveSessionsFeedResponse;
    apiUrl?: string;
    wsUrl?: string | null;
    pollIntervalMs?: number;
};

function flattenGroups(grouped: GroupedLiveSessions): LiveSessionListItem[] {
    return [...grouped.liveNow, ...grouped.upcoming, ...grouped.past];
}

function upsertSession(
    grouped: GroupedLiveSessions,
    nextSession: LiveSessionListItem,
): GroupedLiveSessions {
    const sessions = flattenGroups(grouped).filter(
        (session) => session.id !== nextSession.id,
    );

    sessions.push(nextSession);

    return groupLiveSessions(sessions);
}

function updateViewerCount(
    grouped: GroupedLiveSessions,
    sessionId: string,
    activeViewerCount: number,
): GroupedLiveSessions {
    const sessions = flattenGroups(grouped).map((session) =>
        session.id === sessionId
            ? { ...session, activeViewerCount }
            : session,
    );

    return groupLiveSessions(sessions);
}

function removeSession(
    grouped: GroupedLiveSessions,
    sessionId: string,
): GroupedLiveSessions {
    const sessions = flattenGroups(grouped).filter(
        (session) => session.id !== sessionId,
    );

    return groupLiveSessions(sessions);
}

export function useLiveSessionsFeed({
    initialData,
    apiUrl = "/api/live-sessions",
    wsUrl = process.env.NEXT_PUBLIC_LIVE_SESSIONS_WS_URL ?? null,
    pollIntervalMs = LIVE_SESSIONS_POLL_INTERVAL_MS,
}: UseLiveSessionsFeedOptions) {
    const [data, setData] = useState<LiveSessionsFeedResponse>(initialData);
    const [isPollingRefresh, setIsPollingRefresh] = useState(false);
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);

    // Only connect to WS when there are live or upcoming sessions.
    // Polling (every 30s) handles discovery of new sessions during idle periods.
    const hasActiveSessions =
        data.grouped.liveNow.length + data.grouped.upcoming.length > 0;

    const refresh = useCallback(async () => {
        setIsPollingRefresh(true);

        try {
            const response = await fetch(apiUrl, {
                method: "GET",
                cache: "no-store",
            });

            if (!response.ok) {
                return;
            }

            const nextData = (await response.json()) as LiveSessionsFeedResponse;
            setData(nextData);
        } finally {
            setIsPollingRefresh(false);
        }
    }, [apiUrl]);

    useEffect(() => {
        if (!wsUrl || !hasActiveSessions) {
            return;
        }

        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.addEventListener("open", () => {
            setIsSocketConnected(true);
        });

        socket.addEventListener("close", () => {
            setIsSocketConnected(false);
        });

        socket.addEventListener("error", () => {
            setIsSocketConnected(false);
        });

        socket.addEventListener("message", (event) => {
            try {
                const payload = JSON.parse(event.data) as LiveSessionWsEvent;

                setData((current) => {
                    if (payload.type === "SESSION_UPSERTED") {
                        return {
                            ...current,
                            grouped: upsertSession(current.grouped, payload.session),
                            serverTime: new Date().toISOString(),
                        };
                    }

                    if (payload.type === "VIEWER_COUNT_CHANGED") {
                        return {
                            ...current,
                            grouped: updateViewerCount(
                                current.grouped,
                                payload.sessionId,
                                payload.activeViewerCount,
                            ),
                            serverTime: new Date().toISOString(),
                        };
                    }

                    if (payload.type === "SESSION_REMOVED") {
                        return {
                            ...current,
                            grouped: removeSession(current.grouped, payload.sessionId),
                            serverTime: new Date().toISOString(),
                        };
                    }

                    return current;
                });
            } catch {
                void refresh();
            }
        });

        return () => {
            socket.close();
            socketRef.current = null;
        };
    }, [refresh, wsUrl, hasActiveSessions]);

    useEffect(() => {
        const interval = window.setInterval(() => {
            void refresh();
        }, pollIntervalMs);

        return () => {
            window.clearInterval(interval);
        };
    }, [pollIntervalMs, refresh]);

    const summary = useMemo(() => {
        const grouped = data.grouped;

        return {
            totalLive: grouped.liveNow.length,
            totalUpcoming: grouped.upcoming.length,
            totalPast: grouped.past.length,
        };
    }, [data.grouped]);

    return {
        data,
        summary,
        isPollingRefresh,
        isSocketConnected,
        refresh,
    };
}