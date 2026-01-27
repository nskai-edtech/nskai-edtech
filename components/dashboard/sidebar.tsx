"use client";

import Link from "next/link";
import { useSidebarRoutes } from "./sidebar-routes";
import { UserButton } from "@clerk/nextjs";
import ThemeToggle from "../ModeToggle";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: "TUTOR" | "ORG_ADMIN";
}

export const Sidebar = ({ role }: SidebarProps) => {
  const routes = useSidebarRoutes(role);

  return (
    <div className="h-full flex flex-col border-r border-border bg-surface text-primary-text overflow-y-auto shadow-sm">
      {/* Header  */}
      <div className="p-6">
        <div className="flex items-center gap-2 font-bold text-xl text-brand">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white">
            N
          </div>
          NSKAI
        </div>
      </div>

      {/* Navigation Routes */}
      <div className="flex-1 flex flex-col w-full">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-x-3 px-6 py-4 text-sm font-medium transition-all hover:bg-surface-muted group",
              route.active
                ? "text-brand bg-surface-muted border-r-4 border-brand"
                : "text-secondary-text hover:text-primary-text",
            )}
          >
            <route.icon
              className={cn(
                "w-5 h-5 transition-colors",
                route.active
                  ? "text-brand"
                  : "text-secondary-text group-hover:text-primary-text",
              )}
            />
            {route.label}
          </Link>
        ))}
      </div>

      {/* Footer (Toggle & User) */}
      <div className="p-6 mt-auto border-t border-border flex items-center justify-between">
        <UserButton afterSignOutUrl="/" />
        <ThemeToggle />
      </div>
    </div>
  );
};
