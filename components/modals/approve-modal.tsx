"use client";

import { useModalStore } from "@/hooks/use-modal-store";
import { approveTutor } from "@/actions/admin";
import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";

export const ApproveModal = () => {
  const { isOpen, onClose, type, data } = useModalStore();
  const [isLoading, setIsLoading] = useState(false);

  const isModalOpen =
    isOpen && (type === "approveTutor" || type === "checkTutor");
  if (!isModalOpen) return null;

  const isViewOnly = type === "checkTutor";

  const onConfirm = async () => {
    try {
      const tutorId = data.tutorId || data.tutor?.id;
      if (!tutorId) return;
      setIsLoading(true);
      await approveTutor(tutorId);
      onClose();
      // Optional: Add a toast notification here
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-surface w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-border">
        {/* Header */}
        <div className="p-6 bg-surface-muted border-b border-border">
          <div className="flex items-center gap-3 text-amber-600 dark:text-amber-500 mb-4">
            {!isViewOnly && <AlertTriangle className="w-6 h-6" />}
            <h2 className="text-xl font-bold text-primary-text">
              {isViewOnly ? "Tutor Profile" : "Review Application"}
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-secondary-text uppercase">
                Applicant
              </label>
              <div className="text-base font-medium text-primary-text">
                {data.firstName} {data.lastName}
              </div>
              <div className="text-sm text-secondary-text">{data.email}</div>
            </div>

            <div>
              <label className="text-xs font-semibold text-secondary-text uppercase">
                Expertise
              </label>
              <div className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                {data.expertise}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-secondary-text uppercase">
                Bio / About
              </label>
              <div className="mt-1 p-3 bg-surface border border-border rounded-lg text-sm text-primary-text italic">
                &quot;{data.bio || "No bio provided"}&quot;
              </div>
            </div>
          </div>
        </div>

        {/* Footer / Actions */}
        <div className="p-6 flex items-center justify-end gap-3 bg-surface">
          <button
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-secondary-text hover:bg-surface-muted rounded-lg transition-colors"
          >
            {isViewOnly ? "Close" : "Cancel"}
          </button>

          {!isViewOnly && (
            <button
              disabled={isLoading}
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-bold text-surface bg-primary-text hover:opacity-90 rounded-lg flex items-center gap-2 transition-colors"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirm Approval
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
