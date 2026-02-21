"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { removeCourseFromPath } from "@/actions/learning-paths";
import { Loader2 } from "lucide-react";

export function RemoveCourseButton({ mappingId }: { mappingId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onRemove = async () => {
    try {
      setIsLoading(true);
      const res = await removeCourseFromPath(mappingId);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Failed to remove course.");
      }
    } catch (error) {
      console.error("Error removing course", error);
      alert("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={onRemove}
      disabled={isLoading}
      className="text-sm font-bold text-red-500/70 hover:text-red-600 transition-colors p-2 hover:bg-red-500/10 rounded-lg flex items-center justify-center min-w-[64px]"
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Remove"}
    </button>
  );
}
