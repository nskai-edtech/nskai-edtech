"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { Menu, Bell, Search, X } from "lucide-react";
import { Sidebar } from "./sidebar";
import { schools, users } from "@/drizzle/schema";

export function TopHeader({
  school,
  user,
}: {
  school: typeof schools.$inferSelect;
  user: typeof users.$inferSelect;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Hamburger */}
      <button 
        className="md:hidden mr-4 p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        onClick={() => setIsMobileMenuOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Global Search Placeholder */}
      <div className="flex flex-1 items-center gap-4">
        <form className="hidden sm:flex relative w-full max-w-sm items-center">
          <Search className="absolute left-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="search"
            placeholder="Search students, classes, invoices..."
            className="w-full rounded-md border border-zinc-200 bg-zinc-50 pl-9 pr-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
          />
        </form>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <button 
          className="relative p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">New notifications</span>
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-red-500 dark:border-zinc-900" aria-hidden="true"></span>
        </button>
        
        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800"></div>
        
        <div className="flex items-center gap-3">
           <div className="hidden text-right text-sm md:block">
             <div className="font-medium text-zinc-900 dark:text-white leading-none">
               {user?.firstName} {user?.lastName}
             </div>
             <div className="text-xs text-zinc-500 mt-1 capitalize">
               {user?.role?.replace("_", " ").toLowerCase()}
             </div>
           </div>
           <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      {/* Mobile Sheet Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            role="button"
            tabIndex={0}
            aria-label="Close menu"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setIsMobileMenuOpen(false);
              }
            }}
          ></div>
          
          {/* Drawer (Sheet) */}
          <div className="relative flex w-64 max-w-xs flex-col bg-white dark:bg-zinc-950 shadow-2xl animate-in slide-in-from-left duration-300">
            <button 
               className="absolute right-4 top-4 z-50 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
               onClick={() => setIsMobileMenuOpen(false)}
               aria-label="Close menu"
            >
               <X className="h-6 w-6 text-zinc-500" aria-hidden="true" />
            </button>
            <div className="h-full w-full bg-white dark:bg-zinc-950 overflow-y-auto" role="presentation">
              <Sidebar school={school} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
