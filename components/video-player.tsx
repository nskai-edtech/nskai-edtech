"use client";

import MuxPlayer from "@mux/mux-player-react";
import { useState } from "react";
import { markLessonComplete, updateLastAccessed } from "@/actions/progress";

interface VideoPlayerProps {
  playbackId: string;
  title?: string;
  lessonId?: string;
}

export const VideoPlayer = ({
  playbackId,
  title,
  lessonId,
}: VideoPlayerProps) => {
  const [hasMarkedComplete, setHasMarkedComplete] = useState(false);
  const [hasUpdatedAccess, setHasUpdatedAccess] = useState(false);

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

    // Mark complete when 90% watched
    if (duration && currentTime / duration >= 0.9) {
      await markLessonComplete(lessonId);
      setHasMarkedComplete(true);
    }
  };

  return (
    <div className="relative aspect-video bg-surface-muted rounded-lg overflow-hidden border border-border">
      <MuxPlayer
        playbackId={playbackId}
        accentColor="#ac39f2"
        metadata={{
          video_title: title || "Lesson Video",
        }}
        onPlay={handlePlay}
        onTimeUpdate={handleTimeUpdate}
      />
    </div>
  );
};
