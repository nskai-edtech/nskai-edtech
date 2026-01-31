"use client";

import { useState } from "react";
import MuxUploader from "@mux/mux-uploader-react";
import { getDirectUploadUrl, checkLessonVideoStatus } from "@/actions/mux";
import { Loader2, Upload, Video, X } from "lucide-react";
import toast from "react-hot-toast";

interface MuxUploaderProps {
  lessonId: string;
  onSuccess?: (assetId: string, playbackId: string) => void;
}

export const MuxVideoUploader = ({ lessonId, onSuccess }: MuxUploaderProps) => {
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleUploadStart = async () => {
    setIsGeneratingUrl(true);
    try {
      const result = await getDirectUploadUrl(lessonId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.url && result.id) {
        setUploadUrl(result.url);
        setActiveUploadId(result.id);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to initialize upload");
    } finally {
      setIsGeneratingUrl(false);
    }
  };

  const startPolling = async () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setError(null);
    console.log(
      `[MUX_UPLOADER] Starting status polling for lesson: ${lessonId}, Upload ID: ${activeUploadId}`,
    );

    let attempts = 0;
    const maxAttempts = 60; // 60 * 2s = 120 seconds max

    const poll = setInterval(async () => {
      attempts++;

      // Simulate progress for UX
      setProcessingProgress((prev) => {
        if (prev < 90) return prev + Math.random() * 5;
        if (prev < 98) return prev + 0.5;
        return prev;
      });

      try {
        const result = await checkLessonVideoStatus(
          lessonId,
          activeUploadId || undefined,
        );
        console.log(`[MUX_UPLOADER] Poll ${attempts}:`, result);

        if (result.error) {
          console.error(`[MUX_UPLOADER] Polling error:`, result.error);
          // Don't stop on first error, might be transient
        }

        if (result.muxData?.playbackId) {
          const { assetId, playbackId } = result.muxData;
          console.log(`[MUX_UPLOADER] Video ready! PlaybackID: ${playbackId}`);
          clearInterval(poll);
          setProcessingProgress(100);
          setTimeout(() => {
            setIsProcessing(false);
            toast.success("Video is ready!");
            if (onSuccess) onSuccess(assetId, playbackId);
          }, 500);
        }
      } catch (err) {
        console.error(`[MUX_UPLOADER] Critical polling error:`, err);
      }

      if (attempts >= maxAttempts) {
        console.error(
          `[MUX_UPLOADER] Polling timed out after ${maxAttempts} attempts`,
        );
        clearInterval(poll);
        setIsProcessing(false);
        setError(
          "Processing took too long. Please refresh the page in a few minutes.",
        );
        toast.error("Processing timed out");
      }
    }, 2000);
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-border rounded-xl bg-surface-muted/50">
        <Loader2 className="w-10 h-10 text-brand mb-4 animate-spin" />
        <h3 className="text-lg font-semibold text-primary-text mb-2">
          {processingProgress < 100 ? "Processing Video..." : "Finalizing..."}
        </h3>
        <p className="text-sm text-secondary-text mb-6 text-center max-w-xs">
          Your video is being optimized for streaming. This might take a minute.
        </p>

        <div className="w-full max-w-xs bg-surface border border-border rounded-full h-3 overflow-hidden">
          <div
            className="bg-brand h-full transition-all duration-1000 ease-out rounded-full"
            style={{ width: `${processingProgress}%` }}
          />
        </div>
        <p className="text-[10px] text-secondary-text mt-2 font-mono uppercase tracking-widest">
          {Math.round(processingProgress)}% Complete
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-red-500/20 rounded-xl bg-red-500/5">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <X className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-primary-text mb-2">
          Upload Error
        </h3>
        <p className="text-sm text-red-600/80 mb-6 text-center max-w-xs">
          {error}
        </p>
        <button
          onClick={() => {
            setError(null);
            setUploadUrl(null);
          }}
          className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!uploadUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-xl bg-surface-muted/30 hover:border-brand/50 transition-colors group">
        <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Upload className="w-8 h-8 text-secondary-text group-hover:text-brand transition-colors" />
        </div>
        <h3 className="text-lg font-semibold text-primary-text mb-2">
          Upload Lesson Video
        </h3>
        <p className="text-sm text-secondary-text mb-6 text-center max-w-xs leading-relaxed">
          Drag and drop MP4, MOV or WebM files. <br /> Max file size 4GB.
        </p>
        <button
          onClick={handleUploadStart}
          disabled={isGeneratingUrl}
          className="flex items-center gap-2 px-8 py-3 bg-brand hover:bg-brand/90 text-white rounded-xl font-semibold transition-all shadow-lg shadow-brand/20 disabled:opacity-50 active:scale-95"
        >
          {isGeneratingUrl ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Preparing Secure Channel...
            </>
          ) : (
            <>
              <Video className="w-4 h-4" />
              Select Video File
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 border-2 border-border rounded-xl bg-surface shadow-sm">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-primary-text mb-1">
          Upload in Progress
        </h4>
        <p className="text-xs text-secondary-text">
          Keep this window open until upload finishes.
        </p>
      </div>
      <MuxUploader
        endpoint={uploadUrl}
        onSuccess={() => {
          setUploadUrl(null);
          startPolling();
        }}
        onError={(err) => {
          console.error(err);
          toast.error("Upload failed. Please try again.");
          setUploadUrl(null);
        }}
        className="mux-uploader-custom"
      />
      <button
        onClick={() => setUploadUrl(null)}
        className="mt-6 text-xs text-secondary-text hover:text-red-500 font-medium transition-colors flex items-center gap-1"
      >
        <span>Cancel and go back</span>
      </button>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .mux-uploader-custom::part(file-select) {
          background-color: #ac39f2;
          color: white;
          border-radius: 10px;
          padding: 12px 24px;
          font-family: inherit;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        }
        .mux-uploader-custom::part(file-select):hover {
          background-color: #9333ea;
          transform: translateY(-1px);
        }
        .mux-uploader-custom::part(progress-bar) {
          border-radius: 9999px;
          height: 12px;
          background-color: #f3f4f6;
          margin-top: 20px;
        }
        .mux-uploader-custom::part(progress-bar-value) {
          background: linear-gradient(90deg, #ac39f2, #9333ea);
          border-radius: 9999px;
        }
        .mux-uploader-custom::part(label) {
          color: #111827;
          font-weight: 500;
        }
      `,
        }}
      />
    </div>
  );
};
