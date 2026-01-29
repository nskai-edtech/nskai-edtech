import { ReactNode } from "react";
import { LearnerSidebar } from "@/components/layout/learner-sidebar";

export default function LearnerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-background" suppressHydrationWarning>
      <LearnerSidebar />
      <main className="md:ml-64 flex-1 overflow-y-auto w-full">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 pt-24 sm:pt-16 md:pt-16">
          {children}
        </div>
      </main>
    </div>
  );
}
