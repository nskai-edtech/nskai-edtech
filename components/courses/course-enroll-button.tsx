"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import the base component and disable SSR
export const CourseEnrollButton = dynamic(
  () =>
    import("./course-enroll-button-base").then((mod) => mod.CourseEnrollButton),
  {
    ssr: false,
    loading: () => (
      <button
        disabled
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-brand/50 text-white font-bold rounded-xl cursor-not-allowed"
      >
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading Checkout...
      </button>
    ),
  },
);
