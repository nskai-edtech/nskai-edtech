"use client";

import { useState } from "react";
import { rotateGuestInviteCode } from "@/actions/live-sessions/mutations";
import { useToast } from "@/components/ui/use-toast";

interface GuestInviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  guestCode: string;
}

export function GuestInviteModal({
  open,
  onOpenChange,
  sessionId,
  guestCode,
}: GuestInviteModalProps) {
  const { toast } = useToast();
  const [code, setCode] = useState(guestCode);
  const [isRotating, setIsRotating] = useState(false);

  const handleRotateCode = async () => {
    try {
      setIsRotating(true);
      const result = await rotateGuestInviteCode(sessionId);
      setCode(result.guestInviteCode || "");
      toast({
        title: "Success",
        description: "Guest invite code rotated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to rotate code",
        variant: "destructive",
      });
    } finally {
      setIsRotating(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Copied",
        description: "Guest invite code copied to clipboard",
      });
    } catch (error) {
      console.error("Failed to copy guest invite code", error);
      toast({
        title: "Error",
        description: "Failed to copy code",
        variant: "destructive",
      });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-zinc-900">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Share Guest Invite
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Share this code with guests who want to join without enrolling
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Invite Code
            </label>
            <div className="mt-2 flex gap-2">
              <div className="flex-1 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm font-mono text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
                {code}
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-300">
              💡 Tip
            </p>
            <p className="mt-1 text-xs text-blue-700 dark:text-blue-200">
              Guests can use this code to join the live session without being
              enrolled. Share it on social media or send directly.
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleRotateCode}
            disabled={isRotating}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            {isRotating ? "Rotating..." : "Rotate Code"}
          </button>
        </div>
      </div>
    </div>
  );
}
