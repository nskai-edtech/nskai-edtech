"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiGenerateButtonProps {
  onGenerate: () => Promise<void>;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function AiGenerateButton({
  onGenerate,
  label = "Generate with AI",
  className,
  disabled = false,
}: AiGenerateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleClick = async () => {
    setIsGenerating(true);
    try {
      await onGenerate();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isGenerating || disabled}
      className={cn(
        "group flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md transition-all",
        "bg-brand/10 text-brand hover:bg-brand/20 border border-brand/20",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
    >
      {isGenerating ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Sparkles className="w-3.5 h-3.5 group-hover:animate-pulse" />
      )}
      {isGenerating ? "Enhancing..." : label}
    </button>
  );
}
