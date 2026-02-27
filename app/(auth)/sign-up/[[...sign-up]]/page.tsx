"use client";

import { SignUp, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";

export default function Page() {
  return (
    <>
      <ClerkLoading>
        <div className="h-125 w-90 rounded-xl bg-surface-muted animate-pulse" />
      </ClerkLoading>
      <ClerkLoaded>
        <SignUp />
      </ClerkLoaded>
    </>
  );
}
