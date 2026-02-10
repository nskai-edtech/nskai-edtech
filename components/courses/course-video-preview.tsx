"use client";

import { useState } from "react";
import Image from "next/image";
import { Video } from "lucide-react";
import { VideoPlayer } from "@/components/video-player";

interface CourseVideoPreviewProps {
  imageUrl: string | null;
  title: string;
  previewPlaybackId: string | null;
}

export const CourseVideoPreview = ({
  imageUrl,
  title,
  previewPlaybackId,
}: CourseVideoPreviewProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // If user clicked play and have an ID, show the player
  if (isPlaying && previewPlaybackId) {
    return (
      <div className="relative aspect-video rounded-3xl overflow-hidden border border-border shadow-2xl shadow-brand/10 bg-black">
        <VideoPlayer playbackId={previewPlaybackId} title={title} />
        <button
          onClick={() => setIsPlaying(false)}
          className="absolute top-4 right-4 text-xs bg-black/50 hover:bg-black/70 text-white px-3 py-1 rounded-full backdrop-blur-md transition-colors z-50"
        >
          Close Preview
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => {
        if (previewPlaybackId) {
          setIsPlaying(true);
        }
      }}
      className={`relative aspect-video rounded-3xl overflow-hidden border border-border bg-black/5 group shadow-2xl shadow-brand/10 ${
        previewPlaybackId ? "cursor-pointer" : "cursor-default"
      }`}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Video className="w-20 h-20 text-brand/20" />
        </div>
      )}

      {/* Overlay: Only show if there is a preview video */}
      {previewPlaybackId && (
        <>
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl border border-white/30 transform group-hover:scale-110 transition-transform duration-300">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-inner">
                {/* Play Icon Triangle using CSS border hack from original design */}
                <div className="w-0 h-0 border-t-10 border-t-transparent border-l-18 border-l-brand border-b-10 border-b-transparent ml-1" />
              </div>
            </div>
          </div>
          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white/90">
            <span className="text-sm font-bold bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              Preview: Introduction to {title}
            </span>
          </div>
        </>
      )}
    </div>
  );
};
