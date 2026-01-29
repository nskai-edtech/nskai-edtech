/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useModalStore } from "@/hooks/use-modal-store";
import { MoreHorizontal, ShieldAlert, Ban, User } from "lucide-react";
import { useState } from "react";

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
  // State for dropdown positioning
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

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

  // Otherwise (ACTIVE, SUSPENDED, BANNED), show the dropdown menu
  return (
    <>
      <button
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          // Position menu above the button (subtract menu height ~140px + gap)
          setMenuPosition({
            top: rect.top + window.scrollY - 125,
            left: rect.right - 192,
          });
          setIsOpen(!isOpen);
        }}
        className="p-2 hover:bg-surface-muted rounded-full transition-colors relative"
      >
        <MoreHorizontal className="w-5 h-5 text-secondary-text" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            style={{ top: menuPosition.top, left: menuPosition.left }}
            className="fixed w-48 bg-surface border border-border rounded-lg shadow-lg z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100"
          >
            <button
              onClick={() => {
                onOpen("checkTutor", { ...tutor, tutorId });
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-surface-muted flex items-center gap-2"
            >
              <User className="w-4 h-4" /> Check Data
            </button>

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
              className="w-full text-left px-4 py-2 text-sm hover:bg-surface-muted text-amber-600 dark:text-amber-500 flex items-center gap-2"
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
              className="w-full text-left px-4 py-2 text-sm hover:bg-surface-muted text-red-600 dark:text-red-500 flex items-center gap-2"
            >
              <Ban className="w-4 h-4" />
              {status === "BANNED" ? "Unban Account" : "Ban Account"}
            </button>
          </div>
        </>
      )}
    </>
  );
};
