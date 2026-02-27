"use client";

import { SignIn, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";

export default function Page() {
  return (
    <>
      <ClerkLoading>
        <div className="h-[400px] w-[360px] rounded-xl bg-surface-muted animate-pulse" />
      </ClerkLoading>
      <ClerkLoaded>
        <SignIn />
      </ClerkLoaded>
    </>
  );
}
