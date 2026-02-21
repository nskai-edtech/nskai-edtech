"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Power, PowerOff } from "lucide-react";
import {
  publishLearningPath,
  unpublishLearningPath,
} from "@/actions/learning-paths";

interface PathActionsProps {
  pathId: string;
  isPublished: boolean;
  hasCourses: boolean;
}

export function PathActions({
  pathId,
  isPublished,
  hasCourses,
}: PathActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);

      if (isPublished) {
        const res = await unpublishLearningPath(pathId);
        if (res.success) {
          router.refresh();
        } else {
          alert(res.error || "Something went wrong");
        }
      } else {
        if (!hasCourses) {
          alert(
            "Cannot publish an empty learning path. Add at least one course.",
          );
          return;
        }
        const res = await publishLearningPath(pathId);
        if (res.success) {
          router.refresh();
        } else {
          alert(res.error || "Something went wrong");
        }
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm shrink-0 whitespace-nowrap w-full md:w-auto ${
        isPublished
          ? "bg-secondary-bg text-secondary-text hover:bg-secondary-bg/80"
          : "bg-green-600 text-white hover:bg-green-700"
      }`}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isPublished ? (
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
  );
}
