import { Sparkles } from "lucide-react";

export default function ConciergeLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface">
      {/* Top bar skeleton */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-surface shrink-0">
        <div className="h-5 w-20 rounded-md bg-surface-muted animate-pulse" />
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-full bg-surface-muted animate-pulse" />
          <div className="h-10 w-10 rounded-full bg-surface-muted animate-pulse" />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
          {/* Pulsing icon */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-brand/20 animate-ping" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 border border-brand/20">
              <Sparkles className="h-8 w-8 text-brand animate-pulse" />
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-lg font-bold text-primary-text">
              Loading Zerra Concierge
            </h2>
            <p className="text-sm text-secondary-text">
              Preparing your chat experience…
            </p>
          </div>

          {/* Animated dots */}
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full bg-brand animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-2 h-2 rounded-full bg-brand animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-2 h-2 rounded-full bg-brand animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
