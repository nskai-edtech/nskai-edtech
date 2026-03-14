import type { LiveSessionWsEvent } from "@/lib/live-sessions/types";

/**
 * Pushes a live-session event to the Railway WS server so it can be
 * broadcast to all connected clients in real time.
 *
 * Requires on Vercel:
 *   LIVE_SESSIONS_WS_HTTP_URL = https://your-service.up.railway.app
 *   BROADCAST_SECRET           = <shared secret matching the WS server>
 *
 * If either variable is missing the call is silently skipped — the app
 * still works via the 30-second HTTP polling fallback.
 */
export async function pushLiveSessionEvent(
    event: LiveSessionWsEvent,
): Promise<void> {
    const wsServerUrl = process.env.LIVE_SESSIONS_WS_HTTP_URL;
    const secret = process.env.BROADCAST_SECRET;

    if (!wsServerUrl || !secret) {
        return; // WS server not configured — polling handles updates
    }

    try {
        const res = await fetch(`${wsServerUrl}/broadcast`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-broadcast-secret": secret,
            },
            body: JSON.stringify(event),
        });

        if (!res.ok) {
            console.error(
                `[pushLiveSessionEvent] WS server responded ${res.status}`,
            );
        }
    } catch (err) {
        // Non-fatal — fall back to polling
        console.error("[pushLiveSessionEvent] Could not reach WS server:", err);
    }
}
