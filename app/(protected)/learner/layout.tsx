import { ReactNode } from "react";
import { LearnerSidebar } from "@/components/layout/learner-sidebar";
import { UserButton } from "@clerk/nextjs";
import ThemeToggle from "@/components/ModeToggle";

export default function LearnerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-background" suppressHydrationWarning>
      <LearnerSidebar />
      <main className="md:ml-20 lg:ml-64 flex-1 overflow-y-auto w-full transition-all duration-300 relative">
        <div className="fixed top-4 right-4 md:right-8 z-50 flex items-center gap-4 bg-background/50 backdrop-blur-sm p-2 rounded-full border border-border/50 shadow-sm">
          <ThemeToggle />
          <div suppressHydrationWarning className="flex items-center">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-10 w-10",
                },
              }}
            />
          </div>
        </div>
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 pt-24 sm:pt-16 md:pt-16">
          {children}
        </div>
      </main>
    </div>
  );
}
