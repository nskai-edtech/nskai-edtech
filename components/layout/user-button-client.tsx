"use client";

import { UserButton, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";

type UserButtonParams = Parameters<typeof UserButton>[0];

type UserButtonClientProps = UserButtonParams & {
  /** Tailwind classes for the skeleton size. Defaults to "h-8 w-8". */
  skeletonClassName?: string;
};

export function UserButtonClient({
  skeletonClassName = "h-8 w-8",
  ...props
}: UserButtonClientProps) {
  return (
    <>
      <ClerkLoading>
        <div
          className={`rounded-full bg-surface-muted animate-pulse ${skeletonClassName}`}
        />
      </ClerkLoading>
      <ClerkLoaded>
        <UserButton {...props} />
      </ClerkLoaded>
    </>
  );
}
