"use client";

import { useModalStore } from "@/hooks/use-modal-store";

interface Props {
  tutorId: string;
  status: string | null;
}

export const TutorActionCell = ({ tutorId, status }: Props) => {
  const { onOpen } = useModalStore();

  if (status === "ACTIVE") return null;

  return (
    <button
      onClick={() => onOpen("approveTutor", { tutorId })}
      className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
    >
      Approve Request
    </button>
  );
};
