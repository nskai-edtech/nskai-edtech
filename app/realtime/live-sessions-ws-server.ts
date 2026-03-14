import { WebSocketServer, type WebSocket } from "ws";

import type { LiveSessionWsEvent } from "@/lib/live-sessions/types";

const PORT = Number(process.env.LIVE_SESSIONS_WS_PORT ?? 4001);

const wss = new WebSocketServer({
    port: PORT,
    path: "/live-sessions",
});

const clients = new Set<WebSocket>();

wss.on("connection", (socket) => {
    clients.add(socket);

    socket.send(
        JSON.stringify({
            type: "PING",
        } satisfies LiveSessionWsEvent),
    );

    socket.on("close", () => {
        clients.delete(socket);
    });
});

export function broadcastLiveSessionEvent(event: LiveSessionWsEvent) {
    const message = JSON.stringify(event);

    for (const client of clients) {
        if (client.readyState === client.OPEN) {
            client.send(message);
        }
    }
}

console.log(
    `Live sessions WebSocket server is running at ws://localhost:${PORT}/live-sessions`,
);