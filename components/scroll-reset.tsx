"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Resets `document.body.style.overflow` on every route change.
 * This prevents stale `overflow: hidden` left behind by modals,
 * popovers (e.g. Clerk's UserButton dropdown), or mobile sidebars
 * that unmount without cleaning up.
 */
export function ScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = "";
  }, [pathname]);

  return null;
}
