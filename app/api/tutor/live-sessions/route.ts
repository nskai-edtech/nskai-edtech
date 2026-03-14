import { NextResponse } from "next/server";

import { getTutorLiveSessionsFeed } from "@/actions/live-sessions/tutor-queries";

export async function GET() {
    try {
        const feed = await getTutorLiveSessionsFeed();
        return NextResponse.json(feed);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Failed to load sessions";
        return NextResponse.json({ error: message }, { status: 401 });
    }
}
