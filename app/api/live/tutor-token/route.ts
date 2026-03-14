import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { liveSessions } from "@/drizzle/schema/live-sessions";
import { users } from "@/drizzle/schema/users";
import { db } from "@/lib/db";
import { buildTokenWithUserAccount } from "@/lib/live/agora";

const requestSchema = z.object({
    sessionId: z.string().uuid(),
});

export async function POST(request: Request) {
    try {
        const { userId: clerkUserId } = await auth();

        if (!clerkUserId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const parsed = requestSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 },
            );
        }

        const { sessionId } = parsed.data;

        const tutor = await db.query.users.findFirst({
            where: eq(users.clerkId, clerkUserId),
            columns: {
                id: true,
                role: true,
                clerkId: true,
            },
        });

        if (!tutor) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (tutor.role !== "TUTOR") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const session = await db.query.liveSessions.findFirst({
            where: and(
                eq(liveSessions.id, sessionId),
                eq(liveSessions.hostId, tutor.id),
            ),
            columns: {
                id: true,
                channelName: true,
                status: true,
            },
        });

        if (!session) {
            return NextResponse.json(
                { error: "Live session not found" },
                { status: 404 },
            );
        }

        if (session.status === "ENDED" || session.status === "CANCELLED") {
            return NextResponse.json(
                { error: "This live session is no longer active" },
                { status: 400 },
            );
        }

        const userAccount = tutor.clerkId;

        const { token, expiresAt } = buildTokenWithUserAccount({
            channelName: session.channelName,
            userAccount,
        });

        return NextResponse.json({
            token,
            channelName: session.channelName,
            appId: process.env.AGORA_APP_ID,
            role: "broadcaster",
            userAccount,
            expiresAt,
            sessionId: session.id,
        });
    } catch (error) {
        console.error("[POST_LIVE_TUTOR_TOKEN_ERROR]", error);
        return NextResponse.json(
            { error: "Failed to generate tutor token" },
            { status: 500 },
        );
    }
}