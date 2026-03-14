"use server";

import { and, count, desc, eq, gt, isNull } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

import { liveSessions } from "@/drizzle/schema/live-sessions";
import { liveSessionViewers } from "@/drizzle/schema/live-sessions";
import { users } from "@/drizzle/schema/users";
import { db } from "@/lib/db";
import { groupLiveSessions } from "@/lib/live-sessions/group-live-sessions";
import type {
    LiveSessionListItem,
    LiveSessionsFeedResponse,
} from "@/lib/live-sessions/types";

async function getCurrentUser() {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
        throw new Error("Unauthorized");
    }

    const user = await db.query.users.findFirst({
        where: eq(users.clerkId, clerkUserId),
        columns: {
            id: true,
            role: true,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    return user;
}

function toLiveSessionListItem(
    row: typeof liveSessions.$inferSelect,
    viewerCount: number = 0,
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

/**
 * Get tutor's live sessions with viewer counts
 */
export async function getTutorLiveSessionsFeed(): Promise<LiveSessionsFeedResponse> {
    const user = await getCurrentUser();

    if (user.role !== "TUTOR") {
        throw new Error("Only tutors can view this page");
    }

    // Get all sessions for this tutor
    const rows = await db
        .select()
        .from(liveSessions)
        .where(eq(liveSessions.hostId, user.id))
        .orderBy(desc(liveSessions.startsAt));

    // Active count for LIVE sessions; total historical count for ended/scheduled sessions
    const activeThreshold = new Date(Date.now() - 2 * 60 * 1000);
    const sessions = await Promise.all(
        rows.map(async (row) => {
            const isLive = row.status === "LIVE";
            const viewerCount = await db
                .select({ count: count() })
                .from(liveSessionViewers)
                .where(
                    isLive
                        ? and(
                              eq(liveSessionViewers.sessionId, row.id),
                              isNull(liveSessionViewers.leftAt),
                              gt(liveSessionViewers.lastSeenAt, activeThreshold),
                          )
                        : eq(liveSessionViewers.sessionId, row.id),
                )
                .then((result) => result[0]?.count ?? 0);

            return toLiveSessionListItem(row, viewerCount);
        }),
    );

    return {
        grouped: groupLiveSessions(sessions),
        serverTime: new Date().toISOString(),
    };
}

/**
 * Get a specific tutor session with viewer count
 */
export async function getTutorLiveSessionById(sessionId: string) {
    const user = await getCurrentUser();

    if (user.role !== "TUTOR") {
        throw new Error("Only tutors can view this page");
    }

    const session = await db.query.liveSessions.findFirst({
        where: and(
            eq(liveSessions.id, sessionId),
            eq(liveSessions.hostId, user.id),
        ),
    });

    if (!session) {
        return null;
    }

    const isLive = session.status === "LIVE";
    const activeThreshold = new Date(Date.now() - 2 * 60 * 1000);
    const viewerCount = await db
        .select({ count: count() })
        .from(liveSessionViewers)
        .where(
            isLive
                ? and(
                      eq(liveSessionViewers.sessionId, sessionId),
                      isNull(liveSessionViewers.leftAt),
                      gt(liveSessionViewers.lastSeenAt, activeThreshold),
                  )
                : eq(liveSessionViewers.sessionId, sessionId),
        )
        .then((result) => result[0]?.count ?? 0);

    return toLiveSessionListItem(session, viewerCount);
}

/**
 * Get detailed session analytics
 */
export async function getSessionAnalytics(sessionId: string) {
    const user = await getCurrentUser();

    if (user.role !== "TUTOR") {
        throw new Error("Only tutors can view this page");
    }

    const session = await db.query.liveSessions.findFirst({
        where: and(
            eq(liveSessions.id, sessionId),
            eq(liveSessions.hostId, user.id),
        ),
    });

    if (!session) {
        return null;
    }

    // Get viewer details
    const viewers = await db.query.liveSessionViewers.findMany({
        where: eq(liveSessionViewers.sessionId, sessionId),
    });

    // Calculate duration: for LIVE sessions use now; for ended sessions
    // only use actualEndedAt (never fall back to new Date() to avoid
    // showing time-since-start-until-now for old ended sessions).
    let durationMinutes = 0;
    let durationSeconds = 0;
    if (session.actualStartedAt) {
        const isLive = session.status === "LIVE";
        const end = isLive ? new Date() : session.actualEndedAt;
        if (end) {
            const diffMs = end.getTime() - session.actualStartedAt.getTime();
            durationMinutes = Math.floor(diffMs / 60_000);
            durationSeconds = Math.floor((diffMs % 60_000) / 1_000);
        }
    }

    // For viewers still watching (no leftAt), use lastSeenAt as the end time
    const now = new Date();
    const viewersWithDuration = viewers.filter((v) => v.joinedAt !== null);

    return {
        sessionId: session.id,
        title: session.title,
        status: session.status,
        totalViewers: viewers.length,
        uniqueViewers: new Set(viewers.map((v) => v.learnerId)).size,
        durationMinutes,
        durationSeconds,
        avgSessionDuration:
            viewersWithDuration.length > 0
                ? Math.round(
                    viewersWithDuration.reduce((sum, v) => {
                        const end = v.leftAt ?? v.lastSeenAt ?? now;
                        return sum + (end.getTime() - v.joinedAt!.getTime());
                    }, 0) / viewersWithDuration.length / 60000,
                )
                : 0,
    };
}
