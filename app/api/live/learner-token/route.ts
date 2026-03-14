import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { RtcRole } from "agora-access-token";

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
            return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
        }

        const { sessionId } = parsed.data;

        const learner = await db.query.users.findFirst({
            where: eq(users.clerkId, clerkUserId),
            columns: { id: true, role: true, clerkId: true },
        });

        if (!learner) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const session = await db.query.liveSessions.findFirst({
            where: eq(liveSessions.id, sessionId),
            columns: { id: true, channelName: true, status: true },
        });

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        if (session.status !== "LIVE") {
            return NextResponse.json(
                { error: "Session is not currently live" },
                { status: 400 },
            );
        }

        const appId = process.env.AGORA_APP_ID;
        if (!appId) {
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const { token, expiresAt } = buildTokenWithUserAccount({
            channelName: session.channelName,
            userAccount: learner.clerkId,
            role: RtcRole.SUBSCRIBER,
        });

        return NextResponse.json({
            token,
            channelName: session.channelName,
            appId,
            uid: learner.clerkId,
            expiresAt,
            sessionId: session.id,
        });
    } catch (error) {
        console.error("[POST_LIVE_LEARNER_TOKEN_ERROR]", error);
        return NextResponse.json(
            { error: "Failed to generate viewer token" },
            { status: 500 },
        );
    }
}
