"use client";

import { useEffect, useRef, useState } from "react";
import { X, Loader2 } from "lucide-react";

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => Promise<void>;
  title: string;
  placeholder: string;
  submitLabel?: string;
  isLoading?: boolean;
}

export default function InputModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  placeholder,
  submitLabel = "Create",
  isLoading = false,
}: InputModalProps) {
  const [value, setValue] = useState("");
  const [internalLoading, setInternalLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Disable body scroll
      document.body.style.overflow = "hidden";
      // Focus input
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      // Re-enable body scroll
      document.body.style.overflow = "unset";
      // Reset value
      setValue("");
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !internalLoading) {
      setInternalLoading(true);
      try {
        await onSubmit(value.trim());
        // Only close and reset if successful
        setValue("");
        onClose();
      } catch (error) {
        console.error("Error submitting:", error);
      } finally {
        setInternalLoading(false);
      }
    }
  };

  const handleClose = () => {
    if (!internalLoading) {
      setValue("");
      onClose();
    }
  };

  const loading = isLoading || internalLoading;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-surface border border-border rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-primary-text">{title}</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-surface-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-secondary-text" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 bg-background border border-border rounded-lg text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand/50 mb-4"
          />

          {/* Actions */}
          <div className="flex items-center gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-secondary-text hover:text-primary-text transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!value.trim() || loading}
              className="px-4 py-2 bg-brand hover:bg-brand/90 disabled:bg-brand/50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                submitLabel
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
