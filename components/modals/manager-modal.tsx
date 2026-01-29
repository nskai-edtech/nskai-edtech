"use client";

import { useModalStore } from "@/hooks/use-modal-store";
import {
  suspendTutor,
  unsuspendTutor,
  banTutor,
  unbanTutor,
} from "@/actions/admin";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert, Ban } from "lucide-react";
import toast from "react-hot-toast";

export const ManagerModal = () => {
  const { isOpen, onClose, type, data } = useModalStore();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const isModalOpen =
    isOpen && (type === "suspendTutor" || type === "banTutor");
  if (!isModalOpen) return null;

  const isSuspend = type === "suspendTutor";
  const isBan = type === "banTutor";

  // Check current status to toggle action direction (Suspend vs Unsuspend)
  const isCurrentlySuspended = data.tutor?.status === "SUSPENDED";
  const isCurrentlyBanned = data.tutor?.status === "BANNED";

  const onConfirm = async () => {
    try {
      const tutorId = data.tutorId || data.tutor?.id;
      if (!tutorId) return;
      setIsLoading(true);

      let result;
      let successMessage = "";

      if (isSuspend) {
        if (isCurrentlySuspended) {
          result = await unsuspendTutor(tutorId);
          successMessage = "Tutor account reactivated successfully";
        } else {
          result = await suspendTutor(tutorId);
          successMessage = "Tutor account suspended successfully";
        }
      } else if (isBan) {
        if (isCurrentlyBanned) {
          result = await unbanTutor(tutorId);
          successMessage = "Tutor account unbanned successfully";
        } else {
          result = await banTutor(tutorId);
          successMessage = "Tutor account banned successfully";
        }
      }

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(successMessage);
      }

      onClose();
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  let title = "";
  let description = "";
  let buttonLabel = "";
  let icon = null;
  let colorClass = "";

  if (isSuspend) {
    if (isCurrentlySuspended) {
      title = "Retract Suspension?";
      description =
        "This will reactivate the tutor's account and restore their access immediately.";
      buttonLabel = "Reactivate Account";
      icon = <ShieldAlert className="w-6 h-6" />;
      colorClass = "text-green-600 dark:text-green-500";
    } else {
      title = "Suspend Tutor?";
      description =
        "This will temporarily disable the tutor's account. They will not be able to login.";
      buttonLabel = "Suspend Account";
      icon = <ShieldAlert className="w-6 h-6" />;
      colorClass = "text-amber-600 dark:text-amber-500";
    }
  } else if (isBan) {
    if (isCurrentlyBanned) {
      title = "Unban Tutor?";
      description =
        "This will restore the tutor's access. The ban will be lifted.";
      buttonLabel = "Unban Account";
      icon = <Ban className="w-6 h-6" />;
      colorClass = "text-green-600 dark:text-green-500";
    } else {
      title = "Ban Tutor?";
      description =
        "This will permanently disable the tutor's account. This action is severe.";
      buttonLabel = "Ban Account";
      icon = <Ban className="w-6 h-6" />;
      colorClass = "text-red-600 dark:text-red-500";
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-surface w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-border">
        {/* Header */}
        <div className="p-6 bg-surface-muted border-b border-border">
          <div className={`flex items-center gap-3 mb-2 ${colorClass}`}>
            {icon}
            <h2 className="text-xl font-bold text-primary-text">{title}</h2>
          </div>
          <p className="text-sm text-secondary-text">{description}</p>
          <div className="mt-4 p-3 bg-surface border border-border rounded-lg">
            <div className="text-sm font-medium text-primary-text">
              {data.firstName || data.tutor?.firstName}{" "}
              {data.lastName || data.tutor?.lastName}
            </div>
            <div className="text-xs text-secondary-text">
              {data.email || data.tutor?.email}
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
            Cancel
          </button>

          <button
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-bold text-white hover:opacity-90 rounded-lg flex items-center gap-2 transition-colors ${
              isSuspend
                ? isCurrentlySuspended
                  ? "bg-green-600"
                  : "bg-amber-600"
                : isCurrentlyBanned
                  ? "bg-green-600"
                  : "bg-red-600"
            }`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
