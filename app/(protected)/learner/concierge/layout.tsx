import { ReactNode } from "react";
import { UserButtonClient } from "@/components/layout/user-button-client";
import ThemeToggle from "@/components/ModeToggle";
import Link from "next/link";
import { Home } from "lucide-react";

export default function ConciergeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-surface shrink-0">
        <Link
          href="/learner"
          className="flex items-center gap-2 text-secondary-text hover:text-primary-text transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="text-sm font-semibold hidden sm:inline">Home</span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-surface">
            <UserButtonClient
              skeletonClassName="h-10 w-10"
              appearance={{ elements: { avatarBox: "h-10 w-10" } }}
            />
          </div>
        </div>
      </div>
      {/* Chat fills remaining space */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
