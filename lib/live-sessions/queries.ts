import { and, count, desc, eq, gt, inArray, isNull } from "drizzle-orm";

import { liveSessions, liveSessionViewers } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { groupLiveSessions } from "@/lib/live-sessions/group-live-sessions";
import type {
    LiveSessionListItem,
    LiveSessionsFeedResponse,
} from "@/lib/live-sessions/types";

/** Active = no leftAt + heartbeat within the last 2 minutes. */
const ACTIVE_VIEWER_THRESHOLD_MS = 2 * 60 * 1000;

/**
 * Returns viewer counts per session, adapting the definition based on status:
 * - LIVE     → currently active viewers (no leftAt, recent heartbeat)
 * - ENDED / SCHEDULED / CANCELLED → total historical viewers who ever joined
 *
 * This ensures:
 * - Live sessions show real-time watching count
 * - Ended sessions show meaningful "total viewers who attended" count
 */
async function batchGetViewerCounts(
    sessions: Array<{ id: string; status: string }>,
): Promise<Map<string, number>> {
    if (sessions.length === 0) return new Map();

    const liveIds = sessions.filter((s) => s.status === "LIVE").map((s) => s.id);
    const otherIds = sessions.filter((s) => s.status !== "LIVE").map((s) => s.id);

    const result = new Map<string, number>();

    // Active viewers for LIVE sessions
    if (liveIds.length > 0) {
        const threshold = new Date(Date.now() - ACTIVE_VIEWER_THRESHOLD_MS);
        const rows = await db
            .select({ sessionId: liveSessionViewers.sessionId, count: count() })
            .from(liveSessionViewers)
            .where(
                and(
                    inArray(liveSessionViewers.sessionId, liveIds),
                    isNull(liveSessionViewers.leftAt),
                    gt(liveSessionViewers.lastSeenAt, threshold),
                ),
            )
            .groupBy(liveSessionViewers.sessionId);
        for (const r of rows) result.set(r.sessionId, r.count);
    }

    // Total (historical) viewers for ENDED / SCHEDULED / CANCELLED sessions
    if (otherIds.length > 0) {
        const rows = await db
            .select({ sessionId: liveSessionViewers.sessionId, count: count() })
            .from(liveSessionViewers)
            .where(inArray(liveSessionViewers.sessionId, otherIds))
            .groupBy(liveSessionViewers.sessionId);
        for (const r of rows) result.set(r.sessionId, r.count);
    }

    return result;
}

function toLiveSessionListItem(
    row: typeof liveSessions.$inferSelect,
    viewerCount = 0,
): LiveSessionListItem {
    const isLive = row.status === "LIVE";
    const isEnded = row.status === "ENDED";

    return {
        id: row.id,
        title: row.title,
        description: row.description,
        status: row.status,
        hostId: row.hostId,
        hostRole: row.hostRole,
        hostDisplayName:
            row.hostRole === "ORG_ADMIN" ? "Organization Admin" : "Tutor",
        channelName: row.channelName,
        thumbnailUrl: row.thumbnailUrl,
        recordingUrl: row.recordingUrl,
        startsAt: row.startsAt.toISOString(),
        scheduledEndsAt: row.scheduledEndsAt?.toISOString() ?? null,
        actualStartedAt: row.actualStartedAt?.toISOString() ?? null,
        actualEndedAt: row.actualEndedAt?.toISOString() ?? null,
        activeViewerCount: viewerCount,
        canJoin: isLive,
        canReplay: isEnded && Boolean(row.recordingUrl),
        guestCode: row.guestInviteCode,
    };
}

export async function getLiveSessionsFeed(): Promise<LiveSessionsFeedResponse> {
    const rows = await db
        .select()
        .from(liveSessions)
        .orderBy(desc(liveSessions.startsAt));

    const viewerCounts = await batchGetViewerCounts(
        rows.map((r) => ({ id: r.id, status: r.status })),
    );

    const sessions = rows.map((row) =>
        toLiveSessionListItem(row, viewerCounts.get(row.id) ?? 0),
    );

    return {
        grouped: groupLiveSessions(sessions),
        serverTime: new Date().toISOString(),
    };
}

export async function getLiveSessionById(sessionId: string) {
    const rows = await db
        .select()
        .from(liveSessions)
        .where(eq(liveSessions.id, sessionId))
        .limit(1);

    const session = rows[0];

    if (!session) {
        return null;
    }

    const viewerCounts = await batchGetViewerCounts([
        { id: session.id, status: session.status },
    ]);
    return toLiveSessionListItem(session, viewerCounts.get(session.id) ?? 0);
}
