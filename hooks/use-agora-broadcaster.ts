"use client";

import { useCallback, useEffect, useRef } from "react";
import type {
    IAgoraRTCClient,
    ICameraVideoTrack,
    IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";

import { useLiveStreamStore } from "@/store/live-stream-store";

interface UseBroadcasterOptions {
    sessionId: string;
}

export function useAgoraBroadcaster({ sessionId }: UseBroadcasterOptions) {
    const store = useLiveStreamStore();

    const localVideoRef = useRef<HTMLDivElement>(null);
    const clientRef = useRef<IAgoraRTCClient | null>(null);
    const videoTrackRef = useRef<ICameraVideoTrack | null>(null);
    const audioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);

    const cleanup = useCallback(async () => {
        try {
            videoTrackRef.current?.stop();
            videoTrackRef.current?.close();
        } catch { /* ignore */ }
        try {
            audioTrackRef.current?.stop();
            audioTrackRef.current?.close();
        } catch { /* ignore */ }

        videoTrackRef.current = null;
        audioTrackRef.current = null;

        if (clientRef.current) {
            try {
                await clientRef.current.leave();
            } catch { /* ignore */ }
            clientRef.current = null;
        }
    }, []);

    useEffect(() => {
        let isMounted = true;

        async function init() {
            store.setConnectionState("connecting");
            store.setError(null);

            try {
                // 1. Fetch tutor token (includes appId)
                const res = await fetch("/api/live/tutor-token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sessionId }),
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(
                        (data as { error?: string }).error ?? "Failed to get streaming token",
                    );
                }

                const { token, channelName, appId, userAccount } =
                    await res.json() as {
                        token: string;
                        channelName: string;
                        appId: string;
                        userAccount: string;
                    };

                if (!isMounted) return;

                // 2. Dynamically load Agora SDK (browser-only)
                const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
                AgoraRTC.setLogLevel(4); // errors only

                if (!isMounted) return;

                // 3. Create RTC client in live-broadcast mode
                const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
                clientRef.current = client;

                // 4. Track remote user count (audience joining)
                client.on("user-joined", () => {
                    if (isMounted) {
                        store.setRemoteUserCount(client.remoteUsers.length);
                    }
                });
                client.on("user-left", () => {
                    if (isMounted) {
                        store.setRemoteUserCount(client.remoteUsers.length);
                    }
                });

                // 5. Set role as host/broadcaster
                await client.setClientRole("host");

                // 6. Join the Agora channel
                await client.join(appId, channelName, token, userAccount);

                if (!isMounted) return;

                // 7. Create local microphone + camera tracks
                const [audioTrack, videoTrack] =
                    await AgoraRTC.createMicrophoneAndCameraTracks();

                audioTrackRef.current = audioTrack;
                videoTrackRef.current = videoTrack;

                if (!isMounted) {
                    audioTrack.close();
                    videoTrack.close();
                    return;
                }

                // 8. Publish tracks to the channel
                await client.publish([audioTrack, videoTrack]);

                // 9. Play local preview
                if (localVideoRef.current) {
                    videoTrack.play(localVideoRef.current);
                }

                store.setConnectionState("connected");
                store.setVideoEnabled(true);
                store.setAudioEnabled(true);
            } catch (error) {
                if (!isMounted) return;
                const message =
                    error instanceof Error ? error.message : "Connection failed";
                store.setConnectionState("failed");
                store.setError(message);
            }
        }

        void init();

        return () => {
            isMounted = false;
            void cleanup();
            store.reset();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId]);

    const toggleVideo = useCallback(async () => {
        const track = videoTrackRef.current;
        if (!track) return;
        const next = !track.enabled;
        await track.setEnabled(next);
        store.setVideoEnabled(next);
        // Re-play local preview when re-enabling
        if (next && localVideoRef.current) {
            track.play(localVideoRef.current);
        }
    }, [store]);

    const toggleAudio = useCallback(async () => {
        const track = audioTrackRef.current;
        if (!track) return;
        const next = !track.enabled;
        await track.setEnabled(next);
        store.setAudioEnabled(next);
    }, [store]);

    return { localVideoRef, toggleVideo, toggleAudio };
}
