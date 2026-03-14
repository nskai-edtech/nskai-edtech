import { NextResponse } from "next/server";

import { getLiveSessionsFeed } from "@/lib/live-sessions/queries";

export async function GET() {
    const feed = await getLiveSessionsFeed();

    return NextResponse.json(feed);
}