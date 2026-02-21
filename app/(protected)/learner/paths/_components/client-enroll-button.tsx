"use client";

import dynamic from "next/dynamic";

const DynamicEnrollButton = dynamic(
  () => import("./enroll-path-button").then((mod) => mod.EnrollPathButton),
  {
    ssr: false,
    loading: () => (
      <div className="h-14 w-64 bg-brand/10 rounded-2xl animate-pulse" />
    ),
  },
);

interface ClientEnrollButtonProps {
  pathId: string;
  price: number | null;
  isEnrolled: boolean;
}

export function ClientEnrollButton(props: ClientEnrollButtonProps) {
  return <DynamicEnrollButton {...props} />;
}
