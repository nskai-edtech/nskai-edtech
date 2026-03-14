import { createServer, type IncomingMessage, type ServerResponse } from "http";
import { WebSocketServer, type WebSocket } from "ws";

import type { LiveSessionWsEvent } from "@/lib/live-sessions/types";

// Railway injects $PORT. Fall back to LIVE_SESSIONS_WS_PORT for local dev.
const PORT = Number(
    process.env.PORT ?? process.env.LIVE_SESSIONS_WS_PORT ?? 4001,
);

const BROADCAST_SECRET = process.env.BROADCAST_SECRET ?? "";

// ── Connected WS clients ───────────────────────────────────────────────────

const clients = new Set<WebSocket>();

export function broadcastLiveSessionEvent(event: LiveSessionWsEvent) {
    const message = JSON.stringify(event);
    for (const client of clients) {
        if (client.readyState === client.OPEN) {
            client.send(message);
        }
    }
}

// ── HTTP server (handles /health + /broadcast) ────────────────────────────
// Railway routes HTTP and WS traffic over the same port/domain, so we attach
// the WebSocketServer to this HTTP server instead of creating a standalone one.

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    // ── Health check ──────────────────────────────────────────────────────
    if (req.method === "GET" && req.url === "/health") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("ok");
        return;
    }

    // ── Broadcast endpoint (called by Vercel server actions) ──────────────
    if (req.method === "POST" && req.url === "/broadcast") {
        // Validate shared secret
        const incomingSecret = req.headers["x-broadcast-secret"];
        if (!BROADCAST_SECRET || incomingSecret !== BROADCAST_SECRET) {
            res.writeHead(401, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Unauthorized" }));
            return;
        }

        let body = "";
        req.on("data", (chunk: Buffer) => {
            body += chunk.toString();
        });
        req.on("end", () => {
            try {
                const event = JSON.parse(body) as LiveSessionWsEvent;
                broadcastLiveSessionEvent(event);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ ok: true, clients: clients.size }));
            } catch {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Invalid JSON" }));
            }
        });
        return;
    }

    res.writeHead(404);
    res.end("Not Found");
});

// ── WebSocket server ───────────────────────────────────────────────────────

const wss = new WebSocketServer({ server, path: "/live-sessions" });

wss.on("connection", (socket) => {
    clients.add(socket);

    // Announce connection
    socket.send(
        JSON.stringify({ type: "PING" } satisfies LiveSessionWsEvent),
    );

    socket.on("close", () => {
        clients.delete(socket);
    });

    socket.on("error", () => {
        clients.delete(socket);
    });
});

// ── Start ──────────────────────────────────────────────────────────────────

server.listen(PORT, () => {
    console.log(
        `[ws-server] HTTP + WebSocket server running on port ${PORT}`,
    );
    console.log(`[ws-server]   Health:    http://localhost:${PORT}/health`);
    console.log(`[ws-server]   Broadcast: http://localhost:${PORT}/broadcast  (POST, X-Broadcast-Secret)`);
    console.log(`[ws-server]   WS:        ws://localhost:${PORT}/live-sessions`);
});
