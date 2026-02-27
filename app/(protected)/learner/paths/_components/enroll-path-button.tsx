"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

export const EnrollPathButton = dynamic(
  () => import("./enroll-path-button-base").then((mod) => mod.EnrollPathButton),
  {
    ssr: false,
    loading: () => (
      <button
        disabled
        className="flex items-center justify-center gap-3 bg-brand/50 text-white px-8 py-4 rounded-2xl font-black text-lg w-full cursor-not-allowed"
      >
        <Loader2 className="w-6 h-6 animate-spin" />
        Loading Checkout...
      </button>
    ),
  },
);
