"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  CreditCard,
  Settings,
} from "lucide-react";
import { schools } from "@/drizzle/schema";

export function Sidebar({ school }: { school: typeof schools.$inferSelect }) {
  const pathname = usePathname();

  const links = [
    { href: "/school-dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/school-dashboard/academics", label: "Academics", icon: GraduationCap },
    { href: "/school-dashboard/people", label: "People", icon: Users },
    { href: "/school-dashboard/financials", label: "Financials", icon: CreditCard },
    { href: "/school-dashboard/settings", label: "Settings", icon: Settings },
  ];

  const primaryColor = school?.primaryColor || "#2563eb"; // Fallback blue

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-6 border-zinc-200 dark:border-zinc-800">
        {school?.logoUrl ? (
           // eslint-disable-next-line @next/next/no-img-element
           <img src={school.logoUrl} alt={school.name} className="h-8 w-auto mr-3 rounded" />
        ) : (
           <div 
             className="h-8 w-8 rounded mr-3 flex items-center justify-center font-bold text-white shadow-sm"
             style={{ backgroundColor: primaryColor }}
           >
             {school?.name?.charAt(0) || "S"}
           </div>
        )}
        <span className="font-bold text-zinc-900 dark:text-white truncate">
          {school?.name || "My School"}
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => {
          const isActive = 
            link.href === "/school-dashboard" 
              ? pathname === "/school-dashboard" 
              : pathname.startsWith(link.href);

          const Icon = link.icon;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-white"
              }`}
            >
              <Icon 
                className="h-5 w-5" 
                style={isActive ? { color: primaryColor } : {}} 
              />
              <span style={isActive ? { color: primaryColor } : {}}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 text-xs font-medium text-zinc-400 tracking-wide text-center uppercase">
        Powered by Zerra
      </div>
    </div>
  );
}
