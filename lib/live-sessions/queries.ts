import { desc, eq } from "drizzle-orm";

import { liveSessions } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { groupLiveSessions } from "@/lib/live-sessions/group-live-sessions";
import type {
    LiveSessionListItem,
    LiveSessionsFeedResponse,
} from "@/lib/live-sessions/types";

function toLiveSessionListItem(
    row: typeof liveSessions.$inferSelect,
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
        activeViewerCount: 0,
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

    const sessions = rows.map(toLiveSessionListItem);

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

    return toLiveSessionListItem(session);
}