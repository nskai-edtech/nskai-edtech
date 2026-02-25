"use client";

import { useEffect, useRef, useState } from "react";
import { X, Loader2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { submitCourseRequest } from "@/actions/requests/actions";
import { useRouter } from "next/navigation";

interface CourseRequestModalProps {
  courseId: string;
  courseTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CourseRequestModal = ({
  courseId,
  courseTitle,
  isOpen,
  onClose,
  onSuccess,
}: CourseRequestModalProps) => {
  const router = useRouter();
  const [requestType, setRequestType] = useState<"DRAFT" | "DELETE">("DRAFT");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Word count helper
  const wordCount = reason.trim() ? reason.trim().split(/\s+/).length : 0;
  const isOverLimit = wordCount > 3500;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => textareaRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "unset";
      setReason("");
      setRequestType("DRAFT");
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Please provide a reason for this request.");
      return;
    }
    if (isOverLimit) {
      toast.error("Reason must be 3500 words or less.");
      return;
    }
    if (reason.length > 3500) {
      toast.error("Reason is too long.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitCourseRequest(courseId, requestType, reason);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Request submitted successfully!");
        onSuccess();
        router.refresh(); // ensure dashboard updates
        onClose();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="relative bg-surface border border-border rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-primary-text">
            Submit Course Request
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-surface-muted rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-secondary-text" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-brand/5 border border-brand/10 rounded-lg">
          <p className="text-sm text-secondary-text mb-1">Target Course:</p>
          <p className="font-bold text-primary-text">{courseTitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-bold text-primary-text block">
              Request Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex flex-col p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  requestType === "DRAFT"
                    ? "border-amber-500 bg-amber-500/10"
                    : "border-border hover:border-amber-500/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    name="requestType"
                    value="DRAFT"
                    checked={requestType === "DRAFT"}
                    onChange={() => setRequestType("DRAFT")}
                    className="hidden"
                  />
                  <span className="font-bold text-primary-text">
                    Return to Draft
                  </span>
                </div>
                <span className="text-xs text-secondary-text">
                  Hide from marketplace but keep for enrolled students.
                </span>
              </label>

              <label
                className={`flex flex-col p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  requestType === "DELETE"
                    ? "border-red-500 bg-red-500/10"
                    : "border-border hover:border-red-500/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    name="requestType"
                    value="DELETE"
                    checked={requestType === "DELETE"}
                    onChange={() => setRequestType("DELETE")}
                    className="hidden"
                  />
                  <span className="font-bold text-primary-text">
                    Delete Course
                  </span>
                </div>
                <span className="text-xs text-secondary-text">
                  Permanently remove the course and all data.
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-primary-text flex items-center justify-between">
              <span>Reason for Request</span>
              <span
                className={`text-xs ${isOverLimit ? "text-red-500 font-bold" : "text-secondary-text"}`}
              >
                {wordCount} / 500 words
              </span>
            </label>
            <textarea
              ref={textareaRef}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why you need this course to be taken down or deleted..."
              rows={5}
              className={`w-full px-4 py-3 bg-background border rounded-lg text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 transition-all resize-none ${
                isOverLimit
                  ? "border-red-500 focus:ring-red-500/50"
                  : "border-border focus:ring-brand/50"
              }`}
            />
          </div>

          {requestType === "DELETE" && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>
                <strong>Warning:</strong> Deleting a course is permanent and
                cannot be undone. If approved, all lesson data, videos, and
                student progress will be wiped.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-secondary-text hover:text-primary-text transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isOverLimit || !reason.trim()}
              className={`px-4 py-2 rounded-lg font-medium text-white transition-colors flex items-center gap-2 ${
                requestType === "DELETE"
                  ? "bg-red-500 hover:bg-red-600 disabled:bg-red-500/50"
                  : "bg-brand hover:bg-brand/90 disabled:bg-brand/50"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                "Submit Request"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
