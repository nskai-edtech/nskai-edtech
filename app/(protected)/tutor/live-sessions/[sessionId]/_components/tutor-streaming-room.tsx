"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    Users,
    ChevronLeft,
    PhoneOff,
    Copy,
    Check,
    Loader2,
    AlertCircle,
    Radio,
} from "lucide-react";

import { endLiveSession } from "@/actions/live-sessions/mutations";
import { useAgoraBroadcaster } from "@/hooks/use-agora-broadcaster";
import { useLiveStreamStore } from "@/store/live-stream-store";
import type { LiveSessionListItem } from "@/lib/live-sessions/types";

function formatElapsed(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
        return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

interface TutorStreamingRoomProps {
    session: LiveSessionListItem;
}

export function TutorStreamingRoom({ session }: TutorStreamingRoomProps) {
    const router = useRouter();
    const store = useLiveStreamStore();
    const { localVideoRef, toggleVideo, toggleAudio } = useAgoraBroadcaster({
        sessionId: session.id,
    });

    const [elapsed, setElapsed] = useState(0);
    const [isEnding, setIsEnding] = useState(false);
    const [confirmEnd, setConfirmEnd] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    const handleEndSession = useCallback(async () => {
        if (!confirmEnd) {
            setConfirmEnd(true);
            setTimeout(() => setConfirmEnd(false), 4000);
            return;
        }
        try {
            setIsEnding(true);
            await endLiveSession(session.id);
            store.reset();
            router.push("/tutor/live-sessions");
        } catch {
            setIsEnding(false);
            setConfirmEnd(false);
        }
    }, [confirmEnd, session.id, store, router]);

    const handleCopyInvite = useCallback(async () => {
        if (!session.guestCode) return;
        const inviteUrl = `${window.location.origin}/learner/live-sessions/${session.id}?code=${session.guestCode}`;
        await navigator.clipboard.writeText(inviteUrl).catch(() => null);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [session]);

    const isConnected = store.connectionState === "connected";
    const isConnecting =
        store.connectionState === "connecting" || store.connectionState === "idle";
    const isFailed = store.connectionState === "failed";

    return (
        <div
            className="-m-4 flex flex-col bg-zinc-950"
            style={{ minHeight: "calc(100svh - 60px)" }}
        >
            {/* ── Top bar ────────────────────────────────────────── */}
            <header className="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-800 bg-zinc-900 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                    <Link
                        href="/tutor/live-sessions"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                    >
                        <ChevronLeft size={18} />
                    </Link>
                    <div className="min-w-0">
                        <h1 className="truncate text-sm font-bold text-zinc-100">
                            {session.title}
                        </h1>
                        <p className="truncate font-mono text-xs text-zinc-500">
                            {session.channelName}
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                    {isConnecting && (
                        <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                            <Loader2 size={12} className="animate-spin" />
                            Connecting…
                        </span>
                    )}
                    {isFailed && (
                        <span className="flex items-center gap-1.5 text-xs text-red-400">
                            <AlertCircle size={12} />
                            {store.error ?? "Failed"}
                        </span>
                    )}
                    {isConnected && (
                        <span className="font-mono text-sm tabular-nums text-zinc-300">
                            {formatElapsed(elapsed)}
                        </span>
                    )}
                    <span className="flex items-center gap-1.5 rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300">
                        <Users size={12} />
                        {store.remoteUserCount}
                    </span>
                    {isConnected && (
                        <span className="flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold tracking-wide text-white">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                            LIVE
                        </span>
                    )}
                </div>
            </header>

            {/* ── Video area ─────────────────────────────────────── */}
            <main className="flex flex-1 items-center justify-center p-4 sm:p-8">
                <div className="w-full max-w-4xl">
                    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl shadow-black/60 ring-1 ring-white/5">
                        {/* Connecting */}
                        {isConnecting && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-zinc-900">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
                                    <Radio size={28} className="animate-pulse text-zinc-400" />
                                </div>
                                <p className="text-sm text-zinc-400">Setting up your stream…</p>
                            </div>
                        )}

                        {/* Error */}
                        {isFailed && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-zinc-900">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-950">
                                    <AlertCircle size={28} className="text-red-400" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-red-400">
                                        Stream failed to connect
                                    </p>
                                    <p className="mt-1 max-w-xs text-xs text-zinc-500">
                                        {store.error}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => window.location.reload()}
                                    className="rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:bg-zinc-700"
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {/* Camera off */}
                        {isConnected && !store.isVideoEnabled && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-zinc-900">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
                                    <VideoOff size={28} className="text-zinc-400" />
                                </div>
                                <p className="text-xs text-zinc-500">Camera is off</p>
                            </div>
                        )}

                        {/* Agora renders the local video into this div */}
                        <div ref={localVideoRef} className="h-full w-full" />
                    </div>

                    {isConnected && (
                        <p className="mt-3 text-center text-xs text-zinc-600">
                            You are live ·{" "}
                            <span className="text-zinc-500">
                                {store.remoteUserCount}{" "}
                                {store.remoteUserCount === 1 ? "viewer" : "viewers"} watching
                            </span>
                        </p>
                    )}
                </div>
            </main>

            {/* ── Controls bar ───────────────────────────────────── */}
            <footer className="shrink-0 border-t border-zinc-800 bg-zinc-900 px-4 py-4">
                <div className="mx-auto flex max-w-md items-center justify-center gap-3">
                    {/* Mic */}
                    <button
                        type="button"
                        onClick={() => void toggleAudio()}
                        disabled={!isConnected}
                        title={store.isAudioEnabled ? "Mute" : "Unmute"}
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-40 ${
                            store.isAudioEnabled
                                ? "bg-zinc-700 text-white hover:bg-zinc-600"
                                : "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                        }`}
                    >
                        {store.isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                    </button>

                    {/* Camera */}
                    <button
                        type="button"
                        onClick={() => void toggleVideo()}
                        disabled={!isConnected}
                        title={store.isVideoEnabled ? "Stop camera" : "Start camera"}
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-40 ${
                            store.isVideoEnabled
                                ? "bg-zinc-700 text-white hover:bg-zinc-600"
                                : "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                        }`}
                    >
                        {store.isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                    </button>

                    {/* End session */}
                    <button
                        type="button"
                        onClick={() => void handleEndSession()}
                        disabled={isEnding}
                        className={`flex h-12 shrink-0 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white transition-all disabled:opacity-60 ${
                            confirmEnd
                                ? "animate-pulse bg-red-500 hover:bg-red-400"
                                : "bg-red-600 hover:bg-red-700"
                        }`}
                    >
                        {isEnding ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <PhoneOff size={16} />
                        )}
                        {confirmEnd ? "Tap again to end" : "End Session"}
                    </button>

                    {/* Copy invite link */}
                    {session.guestCode && (
                        <button
                            type="button"
                            onClick={() => void handleCopyInvite()}
                            title="Copy invite link"
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-white transition-colors hover:bg-zinc-600"
                        >
                            {copied ? (
                                <Check size={18} className="text-green-400" />
                            ) : (
                                <Copy size={18} />
                            )}
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
}
