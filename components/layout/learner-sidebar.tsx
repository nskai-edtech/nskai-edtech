"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  BookOpen,
  CheckCircle,
  Menu,
  X,
  User,
  Award,
  Heart,
  Trophy,
  Briefcase,
  Target,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLiveSessionsBadge } from "@/hooks/use-live-sessions-badge";

const navItems = [
  {
    label: "Dashboard",
    href: "/learner",
    icon: LayoutDashboard,
  },
  {
    label: "Live Sessions",
    href: "/learner/live-sessions",
    icon: Radio,
  },
  {
    label: "Portfolio",
    href: "/learner/portfolio",
    icon: Briefcase,
  },
  {
    label: "Leaderboard",
    href: "/learner/leaderboard",
    icon: Trophy,
  },
  {
    label: "Course Marketplace",
    href: "/learner/marketplace",
    icon: ShoppingBag,
  },
  {
    label: "Enrolled Courses",
    href: "/learner/enrolled",
    icon: BookOpen,
  },
  {
    label: "Completed Courses",
    href: "/learner/completed",
    icon: CheckCircle,
  },
  {
    label: "Wishlist",
    href: "/learner/wishlist",
    icon: Heart,
  },
  {
    label: "Certificates",
    href: "/learner/certificates",
    icon: Award,
  },
  {
    label: "Skills",
    href: "/learner/skills",
    icon: Target,
  },
  {
    label: "Profile",
    href: "/learner/profile",
    icon: User,
  },
];

const LIVE_SESSIONS_HREF = "/learner/live-sessions";

export function LearnerSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { liveCount, totalCount } = useLiveSessionsBadge();
  const isLive = liveCount > 0;

  return (
    <>
      {/* Mobile Menu Button */}
      {!isMobileMenuOpen && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed left-4 top-4 z-50 md:hidden p-2 text-primary-text hover:scale-110 transition-transform"
        >
          <Menu className="h-6 w-6" />
        </button>
      )}

      {/* Backdrop for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r border-border bg-surface transition-all duration-300",
          "w-64 md:w-20 lg:w-64",
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo/Brand with Close Button */}
          <div className="flex h-16 items-center justify-between border-b border-border px-6 md:px-0 lg:px-6 md:justify-center lg:justify-between">
            <Link
              href="/learner"
              className="flex items-center gap-2 md:gap-0 lg:gap-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand shrink-0">
                <span className="text-lg font-bold text-white">Z</span>
              </div>
              <span className="text-xl font-bold text-primary-text block md:hidden lg:block">
                ZERRA
              </span>
            </Link>
            {/* Close button for mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-2 text-primary-text hover:scale-110 transition-transform"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              const isLiveSessions = item.href === LIVE_SESSIONS_HREF;
              const showBadge = isLiveSessions && totalCount > 0;
              const badgeLabel = totalCount > 99 ? "99+" : String(totalCount);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand text-white"
                      : "text-secondary-text hover:bg-surface-muted hover:text-primary-text",
                    "md:justify-center lg:justify-start",
                  )}
                  title={item.label}
                >
                  {/* Icon with badge for collapsed state */}
                  <span className="relative shrink-0">
                    <Icon className="h-5 w-5" />
                    {showBadge && (
                      <span
                        className={cn(
                          "absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-0.5 text-[10px] font-bold text-white",
                          isLive ? "bg-red-500" : "bg-brand",
                          // Only visible in collapsed (md) state; hidden in expanded (lg) state
                          "lg:hidden",
                        )}
                        aria-label={`${totalCount} live or upcoming sessions`}
                      >
                        {isLive && (
                          <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
                        )}
                        <span className="relative">{badgeLabel}</span>
                      </span>
                    )}
                  </span>

                  {/* Label + badge for expanded state */}
                  <span className="flex-1 items-center justify-between block md:hidden lg:flex">
                    <span>{item.label}</span>
                    {showBadge && (
                      <span
                        className={cn(
                          "relative ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white",
                          isActive
                            ? "bg-white/30"
                            : isLive
                              ? "bg-red-500"
                              : "bg-brand",
                        )}
                        aria-label={`${totalCount} live or upcoming sessions`}
                      >
                        {isLive && !isActive && (
                          <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
                        )}
                        <span className="relative">{badgeLabel}</span>
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
