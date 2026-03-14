"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { liveSessions } from "@/drizzle/schema/live-sessions";
import { db } from "@/lib/db";
import {
    generateGuestInviteCode,
    getGuestInviteExpiryDate,
} from "@/lib/live/invite";
import { requireTutorUser } from "@/actions/live-sessions/auth";
import { notifyLearnersOfScheduledSession } from "@/lib/live-sessions/notifications";
import { getLiveSessionById } from "@/lib/live-sessions/queries";
import { pushLiveSessionEvent } from "@/lib/live-sessions/broadcast";

const createSessionSchema = z.object({
    title: z.string().trim().min(3).max(255),
    channelName: z
        .string()
        .trim()
        .min(3)
        .max(255)
        .regex(/^[a-zA-Z0-9_-]+$/, "Channel name may only contain letters, numbers, underscores, and hyphens"),
    startsAt: z.date(),
});


export async function createLiveSession(input: {
    title: string;
    channelName: string;
    startsAt: Date;
}) {
    const tutor = await requireTutorUser();
    const parsed = createSessionSchema.parse(input);

    const guestInviteCode = generateGuestInviteCode();
    const guestInviteExpiresAt = getGuestInviteExpiryDate();

    // Guard against duplicate channel names with a user-friendly error
    // instead of letting the DB unique constraint bubble up as a 500.
    const existing = await db.query.liveSessions.findFirst({
        where: eq(liveSessions.channelName, parsed.channelName),
        columns: { id: true },
    });

    if (existing) {
        throw new Error(
            `Channel name "${parsed.channelName}" is already taken. Please choose a different one.`,
        );
    }

    const [session] = await db
        .insert(liveSessions)
        .values({
            hostId: tutor.id,
            hostRole: "TUTOR",
            title: parsed.title,
            channelName: parsed.channelName,
            status: "SCHEDULED",
            startsAt: parsed.startsAt,
            guestAccessEnabled: true,
            guestInviteCode,
            guestInviteRotatedAt: new Date(),
            guestInviteExpiresAt,
        })
        .returning({
            id: liveSessions.id,
            title: liveSessions.title,
            channelName: liveSessions.channelName,
            guestInviteCode: liveSessions.guestInviteCode,
            guestInviteExpiresAt: liveSessions.guestInviteExpiresAt,
            status: liveSessions.status,
        });

    revalidatePath("/tutor/live");

    // Notify enrolled learners server-side (fire and forget)
    notifyLearnersOfScheduledSession({
        sessionId: session.id,
        tutorId: tutor.id,
    }).catch((error) => {
        console.error("[createLiveSession] Failed to notify learners:", error);
    });

    // Push real-time WS event (fire and forget — falls back to polling)
    getLiveSessionById(session.id)
        .then((full) => {
            if (full) void pushLiveSessionEvent({ type: "SESSION_UPSERTED", session: full });
        })
        .catch(() => undefined);

    return session;
}

export async function startLiveSession(sessionId: string) {
    const tutor = await requireTutorUser();

    const [session] = await db
        .update(liveSessions)
        .set({
            status: "LIVE",
            actualStartedAt: new Date(),
            actualEndedAt: null,
            updatedAt: new Date(),
        })
        .where(
            and(eq(liveSessions.id, sessionId), eq(liveSessions.hostId, tutor.id)),
        )
        .returning({
            id: liveSessions.id,
            status: liveSessions.status,
            channelName: liveSessions.channelName,
        });

    if (!session) {
        throw new Error("Live session not found");
    }

    revalidatePath("/tutor/live");

    // Push real-time WS event (fire and forget)
    getLiveSessionById(session.id)
        .then((full) => {
            if (full) void pushLiveSessionEvent({ type: "SESSION_UPSERTED", session: full });
        })
        .catch(() => undefined);

    return session;
}

export async function endLiveSession(sessionId: string) {
    const tutor = await requireTutorUser();

    const [session] = await db
        .update(liveSessions)
        .set({
            status: "ENDED",
            actualEndedAt: new Date(),
            updatedAt: new Date(),
        })
        .where(
            and(eq(liveSessions.id, sessionId), eq(liveSessions.hostId, tutor.id)),
        )
        .returning({
            id: liveSessions.id,
            status: liveSessions.status,
            actualEndedAt: liveSessions.actualEndedAt,
        });

    if (!session) {
        throw new Error("Live session not found");
    }

    revalidatePath("/tutor/live");

    // Push real-time WS event (fire and forget)
    getLiveSessionById(session.id)
        .then((full) => {
            if (full) void pushLiveSessionEvent({ type: "SESSION_UPSERTED", session: full });
        })
        .catch(() => undefined);

    return session;
}

export async function rotateGuestInviteCode(sessionId: string) {
    const tutor = await requireTutorUser();

    const newCode = generateGuestInviteCode();
    const newExpiry = getGuestInviteExpiryDate();
    const now = new Date();

    const [session] = await db
        .update(liveSessions)
        .set({
            guestAccessEnabled: true,
            guestInviteCode: newCode,
            guestInviteRotatedAt: now,
            guestInviteExpiresAt: newExpiry,
            updatedAt: now,
        })
        .where(
            and(eq(liveSessions.id, sessionId), eq(liveSessions.hostId, tutor.id)),
        )
        .returning({
            id: liveSessions.id,
            guestInviteCode: liveSessions.guestInviteCode,
            guestInviteRotatedAt: liveSessions.guestInviteRotatedAt,
            guestInviteExpiresAt: liveSessions.guestInviteExpiresAt,
        });

    if (!session) {
        throw new Error("Live session not found");
    }

    revalidatePath("/tutor/live");

    return session;
}

export async function enableGuestAccess(sessionId: string) {
    const tutor = await requireTutorUser();

    const [session] = await db
        .update(liveSessions)
        .set({
            guestAccessEnabled: true,
            guestInviteCode: generateGuestInviteCode(),
            guestInviteRotatedAt: new Date(),
            guestInviteExpiresAt: getGuestInviteExpiryDate(),
            updatedAt: new Date(),
        })
        .where(
            and(eq(liveSessions.id, sessionId), eq(liveSessions.hostId, tutor.id)),
        )
        .returning({
            id: liveSessions.id,
            guestAccessEnabled: liveSessions.guestAccessEnabled,
            guestInviteCode: liveSessions.guestInviteCode,
            guestInviteExpiresAt: liveSessions.guestInviteExpiresAt,
        });

    if (!session) {
        throw new Error("Live session not found");
    }

    revalidatePath("/tutor/live");

    return session;
}

export async function disableGuestAccess(sessionId: string) {
    const tutor = await requireTutorUser();

    const [session] = await db
        .update(liveSessions)
        .set({
            guestAccessEnabled: false,
            guestInviteCode: null,
            guestInviteExpiresAt: null,
            updatedAt: new Date(),
        })
        .where(
            and(eq(liveSessions.id, sessionId), eq(liveSessions.hostId, tutor.id)),
        )
        .returning({
            id: liveSessions.id,
            guestAccessEnabled: liveSessions.guestAccessEnabled,
        });

    if (!session) {
        throw new Error("Live session not found");
    }

    revalidatePath("/tutor/live");

    return session;
}

const cancelSessionSchema = z.object({
    sessionId: z.string().uuid(),
});

export async function deleteLiveSession(input: { sessionId: string }) {
    const tutor = await requireTutorUser();
    const parsed = cancelSessionSchema.parse(input);

    // Only allow deleting sessions that have already ended or been cancelled
    const existing = await db.query.liveSessions.findFirst({
        where: and(
            eq(liveSessions.id, parsed.sessionId),
            eq(liveSessions.hostId, tutor.id),
        ),
        columns: { id: true, status: true, title: true },
    });

    if (!existing) {
        throw new Error("Live session not found or unauthorized");
    }

    if (existing.status !== "ENDED" && existing.status !== "CANCELLED") {
        throw new Error("Only ended or cancelled sessions can be deleted");
    }

    await db
        .delete(liveSessions)
        .where(
            and(eq(liveSessions.id, parsed.sessionId), eq(liveSessions.hostId, tutor.id)),
        );

    revalidatePath("/tutor/live-sessions");

    // Notify all WS clients that this session is gone
    void pushLiveSessionEvent({ type: "SESSION_REMOVED", sessionId: parsed.sessionId });

    return { id: parsed.sessionId };
}

export async function cancelLiveSession(input: {
    sessionId: string;
}) {
    const tutor = await requireTutorUser();
    const parsed = cancelSessionSchema.parse(input);

    const [session] = await db
        .update(liveSessions)
        .set({
            status: "CANCELLED",
            updatedAt: new Date(),
        })
        .where(
            and(eq(liveSessions.id, parsed.sessionId), eq(liveSessions.hostId, tutor.id)),
        )
        .returning({
            id: liveSessions.id,
            status: liveSessions.status,
            title: liveSessions.title,
        });

    if (!session) {
        throw new Error("Live session not found or unauthorized");
    }

    revalidatePath("/tutor/live-sessions");

    // Push real-time WS event — cancelled sessions are removed from the feed
    void pushLiveSessionEvent({ type: "SESSION_REMOVED", sessionId: session.id });

    return session;
}
