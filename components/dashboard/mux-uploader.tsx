"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import MuxUploader from "@mux/mux-uploader-react";
import { getDirectUploadUrl, checkLessonVideoStatus } from "@/actions/mux";
import {
  Loader2,
  Upload,
  Video,
  X,
  CheckCircle2,
  CloudUpload,
  Clapperboard,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => {
      setIsMobile(
        "ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          window.innerWidth < 768
      );
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

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
  const [mobileUploadProgress, setMobileUploadProgress] = useState(0);
  const [isMobileUploading, setIsMobileUploading] = useState(false);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

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

  const handleMobileFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Check that the file is a video (broad check to support all mobile formats)
      if (!file.type.startsWith("video/")) {
        toast.error("Please select a video file (MP4, MOV, or WebM).");
        return;
      }

      setIsGeneratingUrl(true);
      try {
        const result = await getDirectUploadUrl(lessonId);
        if (result.error || !result.url || !result.id) {
          toast.error(result.error || "Failed to initialize upload");
          return;
        }

        // Store the upload ID locally so it isn't lost to a stale closure
        const currentUploadId = result.id;
        setActiveUploadId(currentUploadId);
        setIsMobileUploading(true);
        setMobileUploadProgress(0);

        const xhr = new XMLHttpRequest();
        xhr.open("PUT", result.url);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setMobileUploadProgress(
              Math.round((event.loaded / event.total) * 100)
            );
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setIsMobileUploading(false);
            setUploadUrl(null);
            startPolling(currentUploadId);
          } else {
            toast.error("Upload failed. Please try again.");
            setIsMobileUploading(false);
          }
        };

        xhr.onerror = () => {
          toast.error("Upload failed. Check your connection and try again.");
          setIsMobileUploading(false);
        };

        xhr.send(file);
      } catch (err) {
        console.error(err);
        toast.error("Failed to initialize upload");
        setIsMobileUploading(false);
      } finally {
        setIsGeneratingUrl(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lessonId]
  );

  const startPolling = async (uploadId?: string) => {
    const resolvedUploadId = uploadId || activeUploadId;
    setIsProcessing(true);
    setProcessingProgress(0);
    setError(null);
    console.log(
      `[MUX_UPLOADER] Starting status polling for lesson: ${lessonId}, Upload ID: ${resolvedUploadId}`,
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
          resolvedUploadId || undefined,
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
    const stage =
      processingProgress < 30
        ? { label: "Analyzing video...", icon: Clapperboard }
        : processingProgress < 70
          ? { label: "Optimizing for streaming...", icon: Sparkles }
          : processingProgress < 100
            ? { label: "Almost there...", icon: CloudUpload }
            : { label: "Done!", icon: CheckCircle2 };

    const StageIcon = stage.icon;

    return (
      <div className="flex flex-col items-center justify-center p-8 border-2 border-brand/20 rounded-xl bg-surface-muted/50 relative overflow-hidden">
        {/* Animated background shimmer */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            background:
              "linear-gradient(110deg, transparent 25%, var(--color-brand) 50%, transparent 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2s infinite linear",
          }}
        />

        {/* Pulsing icon */}
        <div className="relative mb-5">
          <div
            className="absolute inset-0 rounded-full bg-brand/20"
            style={{ animation: "ping-slow 2s cubic-bezier(0,0,0.2,1) infinite" }}
          />
          <div className="relative w-14 h-14 rounded-full bg-brand/10 flex items-center justify-center">
            <StageIcon className="w-7 h-7 text-brand" />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-primary-text mb-1">
          Processing Video
        </h3>
        <p className="text-sm text-secondary-text mb-6 text-center max-w-xs">
          {stage.label}
        </p>

        {/* Progress bar */}
        <div className="w-full max-w-xs bg-surface border border-border rounded-full h-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${processingProgress}%`,
              background: "linear-gradient(90deg, var(--color-brand), #9333ea)",
            }}
          />
        </div>
        <p className="text-[10px] text-secondary-text mt-2 font-mono uppercase tracking-widest">
          {Math.round(processingProgress)}% Complete
        </p>

        {/* Steps */}
        <div className="flex items-center gap-3 mt-6 text-[11px]">
          {[
            { label: "Upload", threshold: 0 },
            { label: "Process", threshold: 30 },
            { label: "Optimize", threshold: 70 },
          ].map((step) => (
            <div key={step.label} className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                  processingProgress >= step.threshold
                    ? "bg-brand"
                    : "bg-border"
                }`}
              />
              <span
                className={`transition-colors duration-500 ${
                  processingProgress >= step.threshold
                    ? "text-primary-text font-medium"
                    : "text-secondary-text"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          @keyframes ping-slow {
            0% { transform: scale(1); opacity: 0.4; }
            75%, 100% { transform: scale(1.8); opacity: 0; }
          }
        `,
          }}
        />
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
          Select MP4, MOV or WebM files. <br /> Max file size 4GB.
        </p>
        {isMobile ? (
          <>
            <input
              type="file"
              ref={mobileFileInputRef}
              onChange={handleMobileFileUpload}
              className="hidden"
              accept="video/mp4,video/quicktime,video/webm"
            />
            <button
              onClick={() => mobileFileInputRef.current?.click()}
              disabled={isGeneratingUrl}
              className="flex items-center gap-2 px-8 py-3 bg-brand hover:bg-brand/90 text-white rounded-xl font-semibold transition-all shadow-lg shadow-brand/20 disabled:opacity-50 active:scale-95"
            >
              {isGeneratingUrl ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Preparing...
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  Select Video File
                </>
              )}
            </button>
          </>
        ) : (
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
        )}
      </div>
    );
  }

  if (isMobileUploading) {
    return (
      <div className="p-6 border-2 border-brand/20 rounded-xl bg-surface shadow-sm relative overflow-hidden">
        {/* Animated background shimmer */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            background:
              "linear-gradient(110deg, transparent 25%, var(--color-brand) 50%, transparent 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2s infinite linear",
          }}
        />

        <div className="relative flex flex-col items-center">
          {/* Animated upload icon */}
          <div className="relative mb-4">
            <div
              className="absolute inset-0 rounded-full bg-brand/20"
              style={{
                animation:
                  "ping-slow 2s cubic-bezier(0,0,0.2,1) infinite",
              }}
            />
            <div className="relative w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center">
              <CloudUpload
                className="w-6 h-6 text-brand"
                style={{
                  animation: "bounce-gentle 1.5s ease-in-out infinite",
                }}
              />
            </div>
          </div>

          <h4 className="text-sm font-semibold text-primary-text mb-1">
            Uploading Video...
          </h4>
          <p className="text-xs text-secondary-text mb-5">
            Keep this window open until upload finishes.
          </p>

          {/* Progress bar with percentage inside */}
          <div className="w-full max-w-xs mb-1">
            <div className="relative bg-surface border border-border rounded-full h-4 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${mobileUploadProgress}%`,
                  background:
                    "linear-gradient(90deg, var(--color-brand), #9333ea)",
                }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-primary-text mix-blend-difference">
                {mobileUploadProgress}%
              </span>
            </div>
          </div>

          {/* Upload speed / status text */}
          <p className="text-[11px] text-secondary-text mt-2">
            {mobileUploadProgress < 100
              ? `${mobileUploadProgress < 50 ? "Sending video data" : "Almost there"}...`
              : "Finalizing upload..."}
          </p>

          <button
            onClick={() => setIsMobileUploading(false)}
            className="mt-5 text-xs text-secondary-text hover:text-red-500 font-medium transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            <span>Cancel</span>
          </button>
        </div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          @keyframes ping-slow {
            0% { transform: scale(1); opacity: 0.4; }
            75%, 100% { transform: scale(1.8); opacity: 0; }
          }
          @keyframes bounce-gentle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
        `,
          }}
        />
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
