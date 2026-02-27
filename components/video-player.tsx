"use client";

import MuxPlayer from "@mux/mux-player-react";
import { useAuth } from "@clerk/nextjs";
import { useState, useRef } from "react";
import { Loader2 } from "lucide-react";
import { logVideoWatchTime } from "@/actions/gamification/points";
import {
  markLessonComplete,
  updateLastAccessed,
} from "@/actions/progress/actions";
import toast from "react-hot-toast";
import { useModalStore } from "@/hooks/use-modal-store";

interface VideoPlayerProps {
  playbackId: string;
  title?: string;
  lessonId?: string;
  lastPlaybackPosition?: number;
}

export const VideoPlayer = ({
  playbackId,
  title,
  lessonId,
  lastPlaybackPosition = 0,
}: VideoPlayerProps) => {
  const [hasMarkedComplete, setHasMarkedComplete] = useState(false);
  const [hasUpdatedAccess, setHasUpdatedAccess] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const lastPingTimeRef = useRef(0);
  const lastSavedPositionRef = useRef(lastPlaybackPosition);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { userId } = useAuth();
  const { onOpen } = useModalStore();

  const handlePlay = async () => {
    if (!lessonId || hasUpdatedAccess) return;
    await updateLastAccessed(lessonId);
    setHasUpdatedAccess(true);
  };

  const handleTimeUpdate = async (event: Event) => {
    if (!lessonId || hasMarkedComplete) return;

    const video = event.target as HTMLVideoElement;
    const currentTime = video.currentTime;
    const duration = video.duration;

    // Gamification Watch Time Logging
    if (userId && currentTime - lastPingTimeRef.current >= 60) {
      lastPingTimeRef.current = currentTime;
      logVideoWatchTime(userId).catch(console.error);
    }

    // Auto-Resume Progress Saving (Debounced 5s)
    if (Math.abs(currentTime - lastSavedPositionRef.current) >= 5) {
      lastSavedPositionRef.current = currentTime;

      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      debounceTimerRef.current = setTimeout(() => {
        import("@/actions/progress/actions")
          .then((module) => {
            module.saveVideoPosition(lessonId, Math.floor(currentTime));
          })
          .catch(console.error);
      }, 1000);
    }

    if (duration && currentTime / duration >= 0.9) {
      const result = await markLessonComplete(lessonId);
      setHasMarkedComplete(true);

      if (result && "courseCompleted" in result && result.courseCompleted) {
        toast.success("Course completed 100%!");
        setTimeout(() => {
          onOpen("courseCompleted", {
            courseId: result.courseId,
            courseTitle: result.courseTitle,
          });
        }, 1500);
      }
    }
  };

  return (
    <div className="relative aspect-video w-full h-full overflow-hidden">
      <div
        className={`absolute inset-0 z-10 flex items-center justify-center bg-slate-900 transition-opacity duration-500 ${
          isReady
            ? "opacity-0 pointer-events-none"
            : "opacity-100 animate-pulse"
        }`}
      >
        <Loader2 className="w-10 h-10 animate-spin text-secondary-text/50" />
      </div>

      <MuxPlayer
        playbackId={playbackId}
        streamType="on-demand"
        accentColor="#ac39f2"
        startTime={lastPlaybackPosition}
        maxResolution="2160p"
        minResolution="480p"
        renditionOrder="desc"
        metadata={{
          video_title: title || "Lesson Video",
        }}
        className="w-full h-full"
        onPlay={handlePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedData={() => setIsReady(true)}
      />
    </div>
  );
};
