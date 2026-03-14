"use client";

import Link from "next/link";
import {
  ChevronLeft,
  Users,
  Loader2,
  AlertCircle,
  Radio,
  Clock,
  CalendarX,
  PlayCircle,
} from "lucide-react";
import { format } from "date-fns";

import { useAgoraViewer } from "@/hooks/use-agora-viewer";
import { useLiveStreamStore } from "@/store/live-stream-store";
import type { LiveSessionListItem } from "@/lib/live-sessions/types";

interface LearnerStreamViewProps {
  session: LiveSessionListItem;
}

function StatusBadge({ status }: { status: LiveSessionListItem["status"] }) {
  if (status === "LIVE") {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold tracking-wide text-white">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
        LIVE
      </span>
    );
  }
  if (status === "SCHEDULED") {
    return (
      <span className="rounded-full bg-blue-600/20 px-3 py-1 text-xs font-semibold text-blue-400">
        Upcoming
      </span>
    );
  }
  if (status === "ENDED") {
    return (
      <span className="rounded-full bg-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-400">
        Ended
      </span>
    );
  }
  return (
    <span className="rounded-full bg-red-900/30 px-3 py-1 text-xs font-semibold text-red-400">
      Cancelled
    </span>
  );
}

function NotLiveState({ session }: { session: LiveSessionListItem }) {
  if (session.status === "SCHEDULED") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600/10">
          <Clock size={36} className="text-blue-400" />
        </div>
        <div>
          <p className="text-lg font-bold text-zinc-100">
            Session hasn&apos;t started yet
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Scheduled for{" "}
            <span className="text-zinc-300">
              {format(new Date(session.startsAt), "PPP 'at' p")}
            </span>
          </p>
        </div>
        <Link
          href="/learner/live-sessions"
          className="mt-2 rounded-xl border border-zinc-700 px-5 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-800"
        >
          Back to sessions
        </Link>
      </div>
    );
  }

  if (session.status === "ENDED") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800">
          {session.canReplay ? (
            <PlayCircle size={36} className="text-zinc-300" />
          ) : (
            <Radio size={36} className="text-zinc-500" />
          )}
        </div>
        <div>
          <p className="text-lg font-bold text-zinc-100">Session has ended</p>
          {session.canReplay && session.recordingUrl ? (
            <p className="mt-1 text-sm text-zinc-400">
              A recording is available.
            </p>
          ) : (
            <p className="mt-1 text-sm text-zinc-500">
              No recording available.
            </p>
          )}
        </div>
        <div className="flex gap-3">
          {session.canReplay && session.recordingUrl && (
            <a
              href={session.recordingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-zinc-700 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-600"
            >
              Watch recording
            </a>
          )}
          <Link
            href="/learner/live-sessions"
            className="rounded-xl border border-zinc-700 px-5 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            Back to sessions
          </Link>
        </div>
      </div>
    );
  }

  // CANCELLED
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-950/40">
        <CalendarX size={36} className="text-red-400" />
      </div>
      <div>
        <p className="text-lg font-bold text-zinc-100">Session was cancelled</p>
        <p className="mt-1 text-sm text-zinc-500">
          This session is no longer available.
        </p>
      </div>
      <Link
        href="/learner/live-sessions"
        className="mt-2 rounded-xl border border-zinc-700 px-5 py-2 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-800"
      >
        Back to sessions
      </Link>
    </div>
  );
}

export function LearnerStreamView({ session }: LearnerStreamViewProps) {
  const store = useLiveStreamStore();
  const isLive = session.status === "LIVE";

  const { remoteVideoRef, hasRemoteVideo } = useAgoraViewer({
    sessionId: session.id,
    enabled: isLive,
  });

  const isConnecting =
    store.connectionState === "connecting" || store.connectionState === "idle";
  const isFailed = store.connectionState === "failed";
  const isConnected = store.connectionState === "connected";

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* ── Top bar ────────────────────────────────────────── */}
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-800 bg-zinc-900 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/learner/live-sessions"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
          >
            <ChevronLeft size={18} />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold text-zinc-100">
              {session.title}
            </h1>
            <p className="truncate text-xs text-zinc-500">
              {session.hostDisplayName}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {isLive && isConnected && (
            <span className="flex items-center gap-1.5 rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300">
              <Users size={12} />
              {store.remoteUserCount + 1}
            </span>
          )}
          <StatusBadge status={session.status} />
        </div>
      </header>

      {/* ── Main area ──────────────────────────────────────── */}
      <main className="flex flex-1 items-center justify-center p-4 sm:p-8">
        {!isLive ? (
          <NotLiveState session={session} />
        ) : (
          <div className="w-full max-w-4xl">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl shadow-black/60 ring-1 ring-white/5">
              {/* Connecting */}
              {isConnecting && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-zinc-900">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
                    <Loader2 size={28} className="animate-spin text-zinc-400" />
                  </div>
                  <p className="text-sm text-zinc-400">Joining session…</p>
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
                      Failed to join
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

              {/* Waiting for host */}
              {isConnected && !hasRemoteVideo && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-zinc-900">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
                    <Radio size={28} className="animate-pulse text-zinc-400" />
                  </div>
                  <p className="text-sm text-zinc-400">
                    Waiting for the host to start streaming…
                  </p>
                </div>
              )}

              {/* Agora renders remote video into this div */}
              <div ref={remoteVideoRef} className="h-full w-full" />
            </div>

            {isConnected && (
              <p className="mt-3 text-center text-xs text-zinc-600">
                {hasRemoteVideo
                  ? `Live stream · ${store.remoteUserCount + 1} watching`
                  : "Connected · waiting for host"}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
