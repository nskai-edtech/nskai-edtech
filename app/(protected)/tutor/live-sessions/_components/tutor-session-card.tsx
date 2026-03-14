"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LiveSessionListItem, LiveSessionStatus } from "@/lib/live-sessions/types";
import {
  startLiveSession,
  endLiveSession,
  cancelLiveSession,
  deleteLiveSession,
} from "@/actions/live-sessions/mutations";
import { getSessionAnalytics } from "@/actions/live-sessions/tutor-queries";
import { useToast } from "@/components/ui/use-toast";
import { CancelSessionDialog } from "./cancel-session-dialog";
import { DeleteSessionDialog } from "./delete-session-dialog";
import { SessionAnalyticsModal } from "./session-analytics-modal";
import { GuestInviteModal } from "./guest-invite-modal";

interface SessionAnalyticsData {
  sessionId: string;
  title: string;
  status: LiveSessionStatus;
  totalViewers: number;
  uniqueViewers: number;
  durationMinutes: number;
  durationSeconds: number;
  avgSessionDuration: number;
}

interface TutorSessionCardProps {
  session: LiveSessionListItem;
  onSessionUpdated?: () => void;
}

export function TutorSessionCard({
  session,
  onSessionUpdated,
}: TutorSessionCardProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showGuestInviteModal, setShowGuestInviteModal] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<SessionAnalyticsData | null>(null);

  const handleStartSession = async () => {
    try {
      setIsLoading(true);
      await startLiveSession(session.id);
      // Redirect to the streaming room
      router.push(`/tutor/live-sessions/${session.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to start session",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleEndSession = async () => {
    try {
      setIsLoading(true);
      await endLiveSession(session.id);
      toast({
        title: "Success",
        description: "Session ended successfully",
      });
      onSessionUpdated?.();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to end session",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSession = async () => {
    try {
      setIsLoading(true);
      await cancelLiveSession({ sessionId: session.id });
      setShowCancelDialog(false);
      toast({
        title: "Success",
        description: "Session cancelled successfully",
      });
      onSessionUpdated?.();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to cancel session",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async () => {
    try {
      setIsLoading(true);
      await deleteLiveSession({ sessionId: session.id });
      setShowDeleteDialog(false);
      toast({
        title: "Success",
        description: "Session deleted successfully",
      });
      onSessionUpdated?.();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete session",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAnalytics = async () => {
    try {
      setIsLoading(true);
      const data = await getSessionAnalytics(session.id);
      setAnalyticsData(data);
      setShowAnalyticsModal(true);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load analytics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const statusColors = {
    LIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    SCHEDULED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    ENDED: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  const startTime = new Date(session.startsAt);
  const formattedTime = startTime.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {session.title}
              </h3>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[session.status]}`}
              >
                {session.status}
              </span>
            </div>

            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {formattedTime}
            </p>

            {session.description && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {session.description}
              </p>
            )}

            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Viewers:
                </span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {session.activeViewerCount}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Channel:
                </span>
                <span className="font-mono text-xs text-zinc-900 dark:text-zinc-100">
                  {session.channelName}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {session.status === "SCHEDULED" && (
              <>
                <button
                  type="button"
                  onClick={handleStartSession}
                  disabled={isLoading}
                  className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50 dark:bg-green-600 dark:hover:bg-green-700"
                >
                  {isLoading ? "Starting..." : "Start Now"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCancelDialog(true)}
                  disabled={isLoading}
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
              </>
            )}

            {session.status === "LIVE" && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/tutor/live-sessions/${session.id}`)
                  }
                  className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                >
                  Go to Stream
                </button>
                <button
                  type="button"
                  onClick={handleEndSession}
                  disabled={isLoading}
                  className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-700"
                >
                  {isLoading ? "Ending..." : "End Session"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowGuestInviteModal(true)}
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Share Invite
                </button>
                <button
                  type="button"
                  onClick={handleViewAnalytics}
                  disabled={isLoading}
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Analytics
                </button>
              </>
            )}

            {session.status === "ENDED" && session.recordingUrl && (
              <a
                href={session.recordingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                View Recording
              </a>
            )}

            {(session.status === "ENDED" || session.status === "CANCELLED") && (
              <>
                <button
                  type="button"
                  onClick={handleViewAnalytics}
                  disabled={isLoading}
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  View Analytics
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isLoading}
                  className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <CancelSessionDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        sessionTitle={session.title}
        onConfirm={handleCancelSession}
        isLoading={isLoading}
      />

      <DeleteSessionDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        sessionTitle={session.title}
        onConfirm={handleDeleteSession}
        isLoading={isLoading}
      />

      {analyticsData && (
        <SessionAnalyticsModal
          open={showAnalyticsModal}
          onOpenChange={setShowAnalyticsModal}
          data={analyticsData}
        />
      )}

      <GuestInviteModal
        open={showGuestInviteModal}
        onOpenChange={setShowGuestInviteModal}
        sessionId={session.id}
        guestCode={session.guestCode || ""}
      />
    </>
  );
}
