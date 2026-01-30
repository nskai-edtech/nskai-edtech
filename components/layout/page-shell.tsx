import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageShellProps {
  children: ReactNode;
  className?: string;
}

export function PageShell({ children, className }: PageShellProps) {
  return (
    <main
      className={cn(
        "mx-auto w-full max-w-7xl",
        "px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10",
        className
      )}
    >
      {children}
    </main>
  );
}
