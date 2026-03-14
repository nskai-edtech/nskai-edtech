"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  Radio,
  X,
  ExternalLink,
  Loader2,
  Users,
  Clock,
  Calendar,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useLiveSessionsBadge } from "@/hooks/use-live-sessions-badge";
import { SessionStatusBadge } from "@/app/(dashboard)/learner/live-sessions/_components/session-status-badge";
import type {
  LiveSessionListItem,
  LiveSessionsFeedResponse,
} from "@/lib/live-sessions/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "live" | "upcoming";

// ─── Session modal card ───────────────────────────────────────────────────────

function SessionModalCard({
  session,
  onClose,
}: {
  session: LiveSessionListItem;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = () => {
    setIsJoining(true);
    router.push(`/learner/live-sessions/${session.id}`);
    onClose();
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 space-y-3 transition-shadow hover:shadow-sm">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1.5">
          <SessionStatusBadge status={session.status} />
          <p className="font-bold text-sm text-primary-text leading-tight line-clamp-2">
            {session.title}
          </p>
          <p className="text-xs text-secondary-text">
            {session.hostDisplayName}
          </p>
        </div>
        {session.activeViewerCount > 0 && (
          <span className="flex items-center gap-1 text-xs text-secondary-text shrink-0 mt-0.5">
            <Users className="w-3.5 h-3.5" />
            {session.activeViewerCount}
          </span>
        )}
      </div>

      {/* Start time */}
      <div className="flex items-center gap-1.5 text-xs text-secondary-text">
        <Clock className="w-3.5 h-3.5 shrink-0" />
        <span>{format(new Date(session.startsAt), "PPP p")}</span>
      </div>

      {/* Join button — only for live sessions the learner can join */}
      {session.status === "LIVE" && session.canJoin && (
        <button
          onClick={handleJoin}
          disabled={isJoining}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 active:bg-red-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer border-none"
        >
          {isJoining ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Joining…
            </>
          ) : (
            <>
              <Radio className="w-4 h-4" />
              Join Live Session
            </>
          )}
        </button>
      )}
    </div>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function SkeletonCards() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-border p-4 space-y-3 animate-pulse"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="h-5 w-20 bg-surface-muted rounded-full" />
              <div className="h-4 w-3/4 bg-surface-muted rounded-full" />
              <div className="h-3 w-1/2 bg-surface-muted rounded-full" />
            </div>
          </div>
          <div className="h-3 w-2/5 bg-surface-muted rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: TabId }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center gap-3">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted">
        {tab === "live" ? (
          <Radio className="w-6 h-6 text-secondary-text" />
        ) : (
          <Calendar className="w-6 h-6 text-secondary-text" />
        )}
      </div>
      <div>
        <p className="font-bold text-primary-text text-sm">
          {tab === "live"
            ? "No live sessions right now"
            : "No upcoming sessions"}
        </p>
        <p className="text-xs text-secondary-text mt-1 max-w-55 mx-auto leading-relaxed">
          {tab === "live"
            ? "Switch to the Upcoming tab to see scheduled sessions."
            : "No sessions have been scheduled yet. Check back later."}
        </p>
      </div>
    </div>
  );
}

// ─── Main FAB component ───────────────────────────────────────────────────────

export function LiveSessionsFab() {
  // Hydration guard — FAB is client-only
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("live");
  const [feedData, setFeedData] = useState<LiveSessionsFeedResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const { liveCount, scheduledCount, totalCount } = useLiveSessionsBadge();
  const isLive = liveCount > 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/live-sessions", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as LiveSessionsFeedResponse;
      setFeedData(data);
      // Default to "live" tab if there are live sessions, otherwise "upcoming"
      setActiveTab(data.grouped.liveNow.length > 0 ? "live" : "upcoming");
    } catch {
      // silently fail — user can retry
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    void fetchSessions();
  };

  const handleClose = () => setIsOpen(false);

  // Close modal on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, mounted]);

  if (!mounted) return null;

  const liveSessions = feedData?.grouped.liveNow ?? [];
  const upcomingSessions = feedData?.grouped.upcoming ?? [];
  const currentSessions =
    activeTab === "live" ? liveSessions : upcomingSessions;

  // Use polled counts before data loads, then use actual feed data
  const liveTabCount = feedData ? liveSessions.length : liveCount;
  const upcomingTabCount = feedData ? upcomingSessions.length : scheduledCount;
  const badgeCount = totalCount > 99 ? "99+" : String(totalCount);

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: "live", label: "Live Now", count: liveTabCount },
    { id: "upcoming", label: "Upcoming", count: upcomingTabCount },
  ];

  return (
    <>
      {/* ── FAB button ── */}
      <button
        onClick={handleOpen}
        className="fixed bottom-22 right-6 z-999 h-14 px-4 bg-surface border border-border text-primary-text rounded-full shadow-lg flex items-center justify-center gap-2 hover:scale-105 hover:shadow-xl active:scale-95 transition-all duration-300 ease-in-out cursor-pointer"
        aria-label="View live sessions"
      >
        {/* Icon with badge */}
        <span className="relative shrink-0">
          <Radio
            className={cn(
              "w-6 h-6 transition-colors",
              isLive ? "text-red-500" : "text-primary-text",
            )}
          />
          {totalCount > 0 && (
            <span
              className={cn(
                "absolute -top-2 -right-2 flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white leading-none",
                isLive ? "bg-red-500" : "bg-brand",
              )}
              aria-label={`${totalCount} live or upcoming sessions`}
            >
              {isLive && (
                <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-70" />
              )}
              <span className="relative">{badgeCount}</span>
            </span>
          )}
        </span>

        {/* Label — hidden on mobile, visible on md+ */}
        <span className="hidden md:block font-semibold text-sm whitespace-nowrap">
          Live Sessions
        </span>
      </button>

      {/* ── Modal ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-1002 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-label="Live sessions"
        >
          <div
            className="bg-surface border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-lg flex flex-col max-h-[80vh] sm:max-h-[75vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl",
                    isLive ? "bg-red-500/10" : "bg-brand/10",
                  )}
                >
                  <Radio
                    className={cn(
                      "w-5 h-5",
                      isLive ? "text-red-500" : "text-brand",
                    )}
                  />
                </div>
                <div>
                  <h2 className="text-base font-bold text-primary-text leading-tight">
                    Live Sessions
                  </h2>
                  {isLive && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[11px] font-semibold text-red-600 dark:text-red-400">
                        {liveCount} session{liveCount !== 1 ? "s" : ""} live
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-xl hover:bg-surface-muted transition-colors border-none bg-transparent cursor-pointer text-secondary-text hover:text-primary-text"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border shrink-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors border-none cursor-pointer",
                    activeTab === tab.id
                      ? "text-brand bg-transparent border-b-2 border-brand"
                      : "text-secondary-text hover:text-primary-text bg-transparent hover:bg-surface-muted/50",
                  )}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      className={cn(
                        "inline-flex items-center justify-center h-5 min-w-5 rounded-full px-1 text-[10px] font-bold leading-none",
                        tab.id === "live"
                          ? "bg-red-500 text-white"
                          : activeTab === tab.id
                            ? "bg-brand text-white"
                            : "bg-surface-muted text-secondary-text",
                      )}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Session list */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <SkeletonCards />
              ) : currentSessions.length === 0 ? (
                <EmptyState tab={activeTab} />
              ) : (
                <div className="space-y-3">
                  {currentSessions.map((session) => (
                    <SessionModalCard
                      key={session.id}
                      session={session}
                      onClose={handleClose}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 pb-4 pt-3 border-t border-border shrink-0">
              <Link
                href="/learner/live-sessions"
                onClick={handleClose}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-border text-sm font-semibold text-primary-text hover:bg-surface-muted transition-colors"
              >
                View all live sessions
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
