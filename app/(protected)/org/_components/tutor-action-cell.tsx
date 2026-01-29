/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useModalStore } from "@/hooks/use-modal-store";
import { MoreHorizontal, ShieldAlert, Ban, User, X, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Props {
  tutorId: string;
  status: string | null;
  tutor: {
    bio: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string;
    expertise: string | null;
  };
}

export const TutorActionCell = ({ tutorId, status, tutor }: Props) => {
  const { onOpen } = useModalStore();
  const [isOpen, setIsOpen] = useState(false);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // If pending, show the review button
  if (status === "PENDING") {
    return (
      <button
        onClick={() =>
          onOpen("approveTutor", {
            tutorId,
            bio: tutor.bio || "",
            firstName: tutor.firstName || "",
            lastName: tutor.lastName || "",
            email: tutor.email,
            expertise: tutor.expertise || "",
          })
        }
        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
      >
        Review Application
      </button>
    );
  }

  // Otherwise (ACTIVE, SUSPENDED, BANNED), show the modal menu
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-surface-muted rounded-full transition-colors"
      >
        <MoreHorizontal className="w-5 h-5 text-secondary-text" />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        >
          {/* Modal Content */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-surface border border-border rounded-xl shadow-2xl w-[320px] max-w-[90vw] animate-in zoom-in-95 slide-in-from-bottom-4 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div>
                <h3 className="font-semibold text-primary-text">
                  {tutor.firstName} {tutor.lastName}
                </h3>
                <p className="text-xs text-secondary-text">{tutor.email}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-surface-muted rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-secondary-text" />
              </button>
            </div>

            {/* Actions */}
            <div className="p-2">
              <Link
                href={`/org/tutors/${tutorId}`}
                onClick={() => setIsOpen(false)}
                className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-surface-muted flex items-center gap-3 text-primary-text transition-colors"
              >
                <Eye className="w-4 h-4 text-brand" />
                View Profile
              </Link>

              <button
                onClick={() => {
                  onOpen("checkTutor", { ...tutor, tutorId });
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-surface-muted flex items-center gap-3 text-primary-text transition-colors"
              >
                <User className="w-4 h-4 text-blue-500" />
                Check Data
              </button>

              <div className="my-1 border-t border-border" />

              <button
                onClick={() => {
                  onOpen("suspendTutor", {
                    ...tutor,
                    bio: tutor.bio || undefined,
                    firstName: tutor.firstName || undefined,
                    lastName: tutor.lastName || undefined,
                    email: tutor.email,
                    expertise: tutor.expertise || undefined,
                    tutorId,
                    tutor: { ...tutor, id: tutorId, status } as any,
                  });
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center gap-3 text-amber-600 dark:text-amber-500 transition-colors"
              >
                <ShieldAlert className="w-4 h-4" />
                {status === "SUSPENDED"
                  ? "Retract Suspension"
                  : "Suspend Account"}
              </button>

              <button
                onClick={() => {
                  onOpen("banTutor", {
                    ...tutor,
                    bio: tutor.bio || undefined,
                    firstName: tutor.firstName || undefined,
                    lastName: tutor.lastName || undefined,
                    email: tutor.email,
                    expertise: tutor.expertise || undefined,
                    tutorId,
                    tutor: { ...tutor, id: tutorId, status } as any,
                  });
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-3 text-red-600 dark:text-red-500 transition-colors"
              >
                <Ban className="w-4 h-4" />
                {status === "BANNED" ? "Unban Account" : "Ban Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
