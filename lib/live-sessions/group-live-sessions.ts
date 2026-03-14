import type {
    GroupedLiveSessions,
    LiveSessionListItem,
} from "@/lib/live-sessions/types";

export function groupLiveSessions(
    sessions: LiveSessionListItem[],
    now = new Date(),
): GroupedLiveSessions {
    const liveNow: LiveSessionListItem[] = [];
    const upcoming: LiveSessionListItem[] = [];
    const past: LiveSessionListItem[] = [];

    for (const session of sessions) {
        const startsAt = new Date(session.startsAt).getTime();

        if (session.status === "LIVE") {
            liveNow.push(session);
            continue;
        }

        if (session.status === "ENDED" || session.status === "CANCELLED") {
            past.push(session);
            continue;
        }

        if (startsAt >= now.getTime()) {
            upcoming.push(session);
            continue;
        }

        past.push(session);
    }

    liveNow.sort(
        (a, b) =>
            new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );

    upcoming.sort(
        (a, b) =>
            new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );

    past.sort(
        (a, b) =>
            new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
    );

    return {
        liveNow,
        upcoming,
        past,
    };
}