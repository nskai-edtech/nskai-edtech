"use client";

import { useRouter, useSearchParams } from "next/navigation";

const RANGES = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Time" },
] as const;

export function XpTimeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("range") || "all";

  function handleClick(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("range");
    } else {
      params.set("range", value);
    }
    const qs = params.toString();
    router.push(`/learner/profile/xp${qs ? `?${qs}` : ""}`);
  }

  return (
    <div className="flex items-center gap-2">
      {RANGES.map((r) => (
        <button
          key={r.value}
          onClick={() => handleClick(r.value)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            active === r.value
              ? "bg-brand text-white"
              : "border border-brand/30 bg-brand/10 text-brand hover:bg-brand/20"
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
