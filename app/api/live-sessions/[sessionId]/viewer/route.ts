import { auth } from "@clerk/nextjs/server";
import { and, count, eq, gt, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

import { liveSessions, liveSessionViewers } from "@/drizzle/schema";
import { users } from "@/drizzle/schema/users";
import { db } from "@/lib/db";
import { pushLiveSessionEvent } from "@/lib/live-sessions/broadcast";

const ACTIVE_VIEWER_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes

async function getActiveViewerCount(sessionId: string): Promise<number> {
    const threshold = new Date(Date.now() - ACTIVE_VIEWER_THRESHOLD_MS);
    const result = await db
        .select({ count: count() })
        .from(liveSessionViewers)
        .where(
            and(
                eq(liveSessionViewers.sessionId, sessionId),
                isNull(liveSessionViewers.leftAt),
                gt(liveSessionViewers.lastSeenAt, threshold),
            ),
        );
    return result[0]?.count ?? 0;
}

async function resolveLearnerId(clerkUserId: string): Promise<string | null> {
    const user = await db.query.users.findFirst({
        where: eq(users.clerkId, clerkUserId),
        columns: { id: true },
    });
    return user?.id ?? null;
}

type RouteContext = { params: Promise<{ sessionId: string }> };

/** POST — viewer joins the live session */
export async function POST(_req: Request, { params }: RouteContext) {
    const { sessionId } = await params;
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const learnerId = await resolveLearnerId(clerkUserId);
    if (!learnerId) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const session = await db.query.liveSessions.findFirst({
        where: eq(liveSessions.id, sessionId),
        columns: { id: true, status: true },
    });

    if (!session || session.status !== "LIVE") {
        return NextResponse.json({ error: "Session not live" }, { status: 400 });
    }

    const now = new Date();

    await db
        .insert(liveSessionViewers)
        .values({
            sessionId,
            learnerId,
            joinedAt: now,
            leftAt: null,
            lastSeenAt: now,
        })
        .onConflictDoUpdate({
            target: [liveSessionViewers.sessionId, liveSessionViewers.learnerId],
            set: {
                joinedAt: now,
                leftAt: null,
                lastSeenAt: now,
                updatedAt: now,
            },
        });

    const activeViewerCount = await getActiveViewerCount(sessionId);

    // Broadcast to all WS clients (fire and forget — non-fatal)
    void pushLiveSessionEvent({
        type: "VIEWER_COUNT_CHANGED",
        sessionId,
        activeViewerCount,
    });

    return NextResponse.json({ ok: true, activeViewerCount });
}

/** PATCH — heartbeat to keep viewer marked as active */
export async function PATCH(_req: Request, { params }: RouteContext) {
    const { sessionId } = await params;
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const learnerId = await resolveLearnerId(clerkUserId);
    if (!learnerId) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date();

    await db
        .update(liveSessionViewers)
        .set({ lastSeenAt: now, updatedAt: now })
        .where(
            and(
                eq(liveSessionViewers.sessionId, sessionId),
                eq(liveSessionViewers.learnerId, learnerId),
                isNull(liveSessionViewers.leftAt),
            ),
        );

    return NextResponse.json({ ok: true });
}

/** DELETE — viewer leaves the live session */
export async function DELETE(_req: Request, { params }: RouteContext) {
    const { sessionId } = await params;
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const learnerId = await resolveLearnerId(clerkUserId);
    if (!learnerId) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date();

    await db
        .update(liveSessionViewers)
        .set({ leftAt: now, updatedAt: now })
        .where(
            and(
                eq(liveSessionViewers.sessionId, sessionId),
                eq(liveSessionViewers.learnerId, learnerId),
                isNull(liveSessionViewers.leftAt),
            ),
        );

    const activeViewerCount = await getActiveViewerCount(sessionId);

    void pushLiveSessionEvent({
        type: "VIEWER_COUNT_CHANGED",
        sessionId,
        activeViewerCount,
    });

    return NextResponse.json({ ok: true, activeViewerCount });
}
