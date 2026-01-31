/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Menu, X } from "lucide-react";
import { Sidebar } from "./sidebar";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface MobileSidebarProps {
  role: "TUTOR" | "ORG_ADMIN";
  counts?: { pendingCourses?: number; pendingTutors?: number };
}

export const MobileSidebar = ({ role, counts }: MobileSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent scrolling when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-surface-muted rounded-lg transition-colors"
      >
        <Menu className="w-6 h-6 text-primary-text" />
      </button>

      {/* Sheet / Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-100">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 w-64 bg-surface shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="h-full relative">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-surface-muted rounded-lg z-110"
              >
                <X className="w-5 h-5 text-primary-text" />
              </button>
              <Sidebar role={role} counts={counts} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
