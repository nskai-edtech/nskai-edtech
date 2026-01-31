"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveCourse, rejectCourse } from "@/actions/courses";
import { Check, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface ReviewActionsProps {
  courseId: string;
}

export default function ReviewActions({ courseId }: ReviewActionsProps) {
  const router = useRouter();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApprove = async () => {
    if (
      !confirm(
        "Are you sure you want to approve this course? It will be published immediately.",
      )
    )
      return;

    setIsApproving(true);
    try {
      const result = await approveCourse(courseId);
      if (result.error) {
        toast.error(result.error);
        setIsApproving(false);
      } else {
        toast.success("Course approved and published!");
        router.push("/org/approvals");
      }
    } catch (error) {
      toast.error("An error occurred during approval");
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt("Please provide a reason for rejection (optional):");
    if (reason === null) return; // User cancelled

    setIsRejecting(true);
    try {
      const result = await rejectCourse(courseId);
      if (result.error) {
        toast.error(result.error);
        setIsRejecting(false);
      } else {
        toast.success("Course rejected");
        router.push("/org/approvals");
      }
    } catch (error) {
      toast.error("An error occurred during rejection");
      setIsRejecting(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleReject}
        disabled={isApproving || isRejecting}
        className="flex items-center gap-2 px-6 py-2.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-all disabled:opacity-50"
      >
        {isRejecting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <X className="w-4 h-4" />
        )}
        Reject Submission
      </button>
      <button
        onClick={handleApprove}
        disabled={isApproving || isRejecting}
        className="flex items-center gap-2 px-6 py-2.5 bg-brand text-white rounded-xl font-semibold hover:bg-brand/90 transition-all shadow-lg shadow-brand/20 disabled:opacity-50"
      >
        {isApproving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Check className="w-4 h-4" />
        )}
        Approve & Publish
      </button>
    </div>
  );
}
