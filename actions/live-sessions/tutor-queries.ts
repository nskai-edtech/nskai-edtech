"use server";

import { and, count, desc, eq } from "drizzle-orm";
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

    // Get viewer counts for each session
    const sessions = await Promise.all(
        rows.map(async (row) => {
            const viewerCount = await db
                .select({ count: count() })
                .from(liveSessionViewers)
                .where(eq(liveSessionViewers.sessionId, row.id))
                .then((result) => result[0]?.count || 0);

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

    const viewerCount = await db
        .select({ count: count() })
        .from(liveSessionViewers)
        .where(eq(liveSessionViewers.sessionId, sessionId))
        .then((result) => result[0]?.count || 0);

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

    // Calculate duration if session has ended
    let durationMinutes = 0;
    if (session.actualStartedAt && session.actualEndedAt) {
        durationMinutes = Math.round(
            (session.actualEndedAt.getTime() - session.actualStartedAt.getTime()) / 60000,
        );
    }

    return {
        sessionId: session.id,
        title: session.title,
        status: session.status,
        totalViewers: viewers.length,
        uniqueViewers: new Set(viewers.map((v) => v.learnerId)).size,
        durationMinutes,
        avgSessionDuration:
            viewers.length > 0
                ? Math.round(
                    viewers.reduce((sum, v) => {
                        if (v.joinedAt && v.leftAt) {
                            return sum + (v.leftAt.getTime() - v.joinedAt.getTime());
                        }
                        return sum;
                    }, 0) / viewers.length / 60000,
                )
                : 0,
    };
}
