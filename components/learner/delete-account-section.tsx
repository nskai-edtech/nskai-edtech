"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { deleteAccount } from "@/actions/profile/actions";

const CONFIRMATION_PHRASE = "DELETE MY ACCOUNT";

export function DeleteAccountSection() {
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { signOut } = useClerk();

  const isConfirmed = confirmText === CONFIRMATION_PHRASE;

  async function handleDelete() {
    if (!isConfirmed) return;

    setIsDeleting(true);
    try {
      const result = await deleteAccount();

      if (!result.success) {
        toast.error(result.error || "Failed to delete account");
        setIsDeleting(false);
        return;
      }

      toast.success("Account deleted successfully");
      await signOut();
      router.push("/");
    } catch {
      toast.error("Something went wrong. Please try again.");
      setIsDeleting(false);
    }
  }

  function handleClose() {
    if (isDeleting) return;
    setShowModal(false);
    setConfirmText("");
  }

  return (
    <>
      {/* Danger Zone Card */}
      <div className="bg-surface border border-red-200 dark:border-red-900/50 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-red-200 dark:border-red-900/50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="font-bold text-lg text-red-600 dark:text-red-400">
              Danger Zone
            </h2>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-text">
                Delete Account
              </p>
              <p className="text-xs text-secondary-text max-w-sm mt-1">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal Content */}
          <div className="relative bg-surface w-full max-w-md rounded-xl shadow-2xl border border-border p-6 mx-4">
            {/* Close Button */}
            <button
              onClick={handleClose}
              disabled={isDeleting}
              className="absolute top-4 right-4 text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Warning Icon */}
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>

            <h3 className="text-lg font-bold text-primary-text text-center mb-2">
              Delete Your Account?
            </h3>

            <p className="text-sm text-secondary-text text-center mb-6">
              This will permanently delete your account, including all your
              course progress, certificates, achievements, and personal data.
              This action is{" "}
              <strong className="text-red-500">irreversible</strong>.
            </p>

            {/* Confirmation Input */}
            <div className="mb-6">
              <label
                htmlFor="confirm-delete"
                className="block text-sm font-medium text-primary-text mb-2"
              >
                Type{" "}
                <span className="font-mono text-red-500 font-bold">
                  {CONFIRMATION_PHRASE}
                </span>{" "}
                to confirm
              </label>
              <input
                id="confirm-delete"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                disabled={isDeleting}
                placeholder={CONFIRMATION_PHRASE}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface-muted text-primary-text placeholder:text-secondary-text/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 disabled:opacity-50"
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-primary-text bg-surface-muted border border-border rounded-lg hover:bg-surface transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!isConfirmed || isDeleting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete My Account"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
