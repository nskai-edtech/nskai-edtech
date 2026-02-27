"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Power,
  PowerOff,
  AlertTriangle,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  publishLearningPath,
  unpublishLearningPath,
} from "@/actions/learning-paths/actions";

interface PathActionsProps {
  pathId: string;
  isPublished: boolean;
  hasCourses: boolean;
  totalPrice: string;
  bundlePrice: string;
}

export function PathActions({
  pathId,
  isPublished,
  hasCourses,
  totalPrice,
  bundlePrice,
}: PathActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    if (!isPublished && !hasCourses) {
      toast.error(
        "Cannot publish an empty learning path. Add at least one course.",
      );
      return;
    }
    setIsOpen(true);
  };

  const onConfirm = async () => {
    try {
      setIsLoading(true);

      if (isPublished) {
        const res = await unpublishLearningPath(pathId);
        if (res.success) {
          toast.success("Learning path unpublished");
          router.refresh();
        } else {
          toast.error(res.error || "Something went wrong");
        }
      } else {
        const res = await publishLearningPath(pathId);
        if (res.success) {
          toast.success("Learning path published!");
          router.refresh();
        } else {
          toast.error(res.error || "Something went wrong");
        }
      }

      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm shrink-0 whitespace-nowrap w-full sm:w-auto ${
          isPublished
            ? "bg-surface border border-border text-secondary-text hover:bg-surface-muted"
            : "bg-green-600 text-white hover:bg-green-700"
        }`}
      >
        {isPublished ? (
          <>
            <PowerOff className="w-5 h-5" />
            Unpublish
          </>
        ) : (
          <>
            <Power className="w-5 h-5" />
            Publish Path
          </>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="bg-surface border border-border rounded-2xl sm:rounded-3xl p-6 sm:p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  isPublished
                    ? "bg-amber-100 dark:bg-amber-500/10 text-amber-600"
                    : "bg-green-100 dark:bg-green-500/10 text-green-600"
                }`}
              >
                {isPublished ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <Power className="w-6 h-6" />
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-surface-muted transition-colors text-secondary-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-xl font-black text-primary-text mb-2">
              {isPublished ? "Unpublish Path?" : "Publish Path?"}
            </h3>
            <p className="text-sm text-secondary-text mb-6">
              {isPublished
                ? "This learning path will no longer be visible to learners. You can republish it at any time."
                : "This learning path will become visible to all learners. Make sure the curriculum is ready."}
            </p>

            <div className="bg-surface-muted/50 border border-border rounded-xl p-4 mb-6 space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-secondary-text">Total Value</span>
                <span className="text-sm font-bold line-through text-secondary-text/50">{totalPrice}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-primary-text">Bundle Price</span>
                <span className="text-xl font-black text-brand">{bundlePrice}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2.5 px-4 bg-surface hover:bg-surface-muted text-primary-text font-bold rounded-xl transition-colors border border-border"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={onConfirm}
                className={`flex-1 py-2.5 px-4 font-bold rounded-xl transition-colors flex justify-center items-center gap-2 ${
                  isPublished
                    ? "bg-amber-600 text-white hover:bg-amber-700"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isPublished ? (
                  "Unpublish"
                ) : (
                  "Publish"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
