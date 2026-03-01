"use client";

import { useState, useEffect, type ReactNode } from "react";
import { Lock, PlayCircle } from "lucide-react";

interface QuizGateProps {
  /** Whether the video on this lesson was already completed (from server) */
  videoCompleted: boolean;
  /** The current lesson ID — used to match the custom event */
  lessonId: string;
  /** Whether the lesson has a video (if false, quiz is always unlocked) */
  hasVideo: boolean;
  children: ReactNode;
}

/**
 * Wraps the quiz section on a lesson page.
 * If the lesson has a video that hasn't been watched to ≥90%,
 * a locked overlay is shown and interaction is blocked.
 * Unlocks in real-time when the VideoPlayer dispatches a "video-completed" event.
 */
export function QuizGate({
  videoCompleted,
  lessonId,
  hasVideo,
  children,
}: QuizGateProps) {
  const serverUnlocked = !hasVideo || videoCompleted;
  const [realtimeUnlocked, setRealtimeUnlocked] = useState(false);
  const isUnlocked = serverUnlocked || realtimeUnlocked;

  useEffect(() => {
    // If there's no video or already unlocked, nothing to listen for
    if (!hasVideo || isUnlocked) return;

    function handleVideoCompleted(e: Event) {
      const detail = (e as CustomEvent<{ lessonId: string }>).detail;
      if (detail.lessonId === lessonId) {
        setRealtimeUnlocked(true);
      }
    }

    window.addEventListener("video-completed", handleVideoCompleted);
    return () => {
      window.removeEventListener("video-completed", handleVideoCompleted);
    };
  }, [hasVideo, isUnlocked, lessonId]);

  if (isUnlocked) {
    return <>{children}</>;
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-surface">
      <div className="flex items-center justify-between w-full p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-surface-muted rounded-xl border border-border">
            <Lock className="w-5 h-5 text-secondary-text" />
          </div>
          <div>
            <span className="font-bold text-primary-text">Quiz Locked</span>
            <p className="text-secondary-text text-xs mt-0.5">
              Watch the video above to unlock
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-brand text-sm font-medium">
          <PlayCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Continue watching</span>
        </div>
      </div>
    </div>
  );
}
