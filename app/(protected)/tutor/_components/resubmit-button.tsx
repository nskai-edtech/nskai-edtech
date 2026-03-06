"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { resetTutorApplication } from "@/actions/onboarding";

export function ResubmitButton() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const handleResubmit = async () => {
    try {
      setIsLoading(true);
      const res = await resetTutorApplication();
      if (res.error) {
        toast.error(res.error);
        setIsLoading(false);
        return;
      }
      
      await user?.reload();
      window.location.href = "/onboarding";
    } catch (error) {
      console.log(error);
      toast.error("Failed to reset application.");
      setIsLoading(false);
    }
  };

  return (
    <button
      disabled={isLoading}
      onClick={handleResubmit}
      className="mt-4 px-6 py-2.5 bg-brand hover:bg-brand/90 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      Re-submit your application
    </button>
  );
}
