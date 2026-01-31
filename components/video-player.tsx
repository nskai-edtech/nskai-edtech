"use client";

import MuxPlayer from "@mux/mux-player-react";

interface VideoPlayerProps {
  playbackId: string;
  title?: string;
}

export const VideoPlayer = ({ playbackId, title }: VideoPlayerProps) => {
  return (
    <div className="relative aspect-video bg-surface-muted rounded-lg overflow-hidden border border-border">
      <MuxPlayer
        playbackId={playbackId}
        accentColor="#ac39f2"
        metadata={{
          video_title: title || "Lesson Video",
        }}
      />
    </div>
  );
};
