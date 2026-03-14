"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { IAgoraRTCClient } from "agora-rtc-sdk-ng";

import { useLiveStreamStore } from "@/store/live-stream-store";

interface UseViewerOptions {
    sessionId: string;
    enabled?: boolean;
}

export function useAgoraViewer({ sessionId, enabled = true }: UseViewerOptions) {
    const store = useLiveStreamStore();

    const remoteVideoRef = useRef<HTMLDivElement>(null);
    const clientRef = useRef<IAgoraRTCClient | null>(null);
    const [hasRemoteVideo, setHasRemoteVideo] = useState(false);

    const cleanup = useCallback(async () => {
        if (clientRef.current) {
            try { await clientRef.current.leave(); } catch { /* ignore */ }
            clientRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!enabled) return;

        let isMounted = true;

        async function init() {
            store.setConnectionState("connecting");
            store.setError(null);

            try {
                const res = await fetch("/api/live/learner-token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sessionId }),
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error((data as { error?: string }).error ?? "Failed to get viewer token");
                }

                const { token, channelName, appId, uid } = await res.json() as {
                    token: string; channelName: string; appId: string; uid: string;
                };

                if (!isMounted) return;

                const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
                AgoraRTC.setLogLevel(4);

                if (!isMounted) return;

                const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
                clientRef.current = client;

                // Subscribe to host's published tracks
                client.on("user-published", async (user, mediaType) => {
                    await client.subscribe(user, mediaType);
                    if (!isMounted) return;

                    if (mediaType === "video") {
                        setHasRemoteVideo(true);
                        if (remoteVideoRef.current) {
                            user.videoTrack?.play(remoteVideoRef.current);
                        }
                    }
                    if (mediaType === "audio") {
                        user.audioTrack?.play();
                    }
                });

                client.on("user-unpublished", (_user, mediaType) => {
                    if (mediaType === "video" && isMounted) {
                        setHasRemoteVideo(false);
                    }
                });

                client.on("user-joined", () => {
                    if (isMounted) store.setRemoteUserCount(client.remoteUsers.length);
                });

                client.on("user-left", () => {
                    if (isMounted) {
                        store.setRemoteUserCount(client.remoteUsers.length);
                        if (client.remoteUsers.length === 0) setHasRemoteVideo(false);
                    }
                });

                await client.setClientRole("audience");
                await client.join(appId, channelName, token, uid);

                if (!isMounted) return;

                store.setConnectionState("connected");
            } catch (error) {
                if (!isMounted) return;
                store.setConnectionState("failed");
                store.setError(error instanceof Error ? error.message : "Failed to join session");
            }
        }

        void init();

        return () => {
            isMounted = false;
            void cleanup();
            store.reset();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId, enabled]);

    return { remoteVideoRef, hasRemoteVideo };
}
