"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Rocket } from "lucide-react";
import { enrollInLearningPath } from "@/actions/learning-paths";

export function EnrollPathButton({ pathId }: { pathId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onEnroll = async () => {
    try {
      setIsLoading(true);
      const res = await enrollInLearningPath(pathId);

      if (res.success) {
        alert(
          "Successfully enrolled in the track! You can now access all its courses.",
        );
        router.refresh();
      } else {
        alert(res.error || "Failed to enroll in curriculum.");
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
      onClick={onEnroll}
      disabled={isLoading}
      className="flex items-center gap-2 bg-brand text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-brand/90 hover:-translate-y-1 transition-all shadow-lg shadow-brand/20 disabled:opacity-50"
    >
      {isLoading ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : (
        <>
          <Rocket className="w-6 h-6" />
          Enroll in Full Track
        </>
      )}
    </button>
  );
}
