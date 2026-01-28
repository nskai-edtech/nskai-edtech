/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Menu, X } from "lucide-react";
import { Sidebar } from "./sidebar";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface MobileSidebarProps {
  role: "TUTOR" | "ORG_ADMIN";
}

export const MobileSidebar = ({ role }: MobileSidebarProps) => {
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
        className="xl:hidden pr-4 hover:opacity-75 transition text-primary-text"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-100 xl:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-101 w-72 bg-surface transition-transform duration-300 ease-in-out xl:hidden flex flex-col h-full border-r border-border",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="absolute right-4 top-4 z-102 xl:hidden">
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-surface-muted rounded-full text-secondary-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <Sidebar role={role} />
      </div>
    </>
  );
};
