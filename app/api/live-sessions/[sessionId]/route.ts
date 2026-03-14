import { NextResponse } from "next/server";

import { getLiveSessionById } from "@/lib/live-sessions/queries";

type RouteContext = {
    params: Promise<{
        sessionId: string;
    }>;
};

export async function GET(_: Request, { params }: RouteContext) {
    const { sessionId } = await params;
    const session = await getLiveSessionById(sessionId);

    if (!session) {
        return NextResponse.json(
            { message: "Live session not found." },
            { status: 404 },
        );
    }

    return NextResponse.json(session);
}