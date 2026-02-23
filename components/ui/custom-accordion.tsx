"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function CustomAccordion({
  title,
  children,
  defaultOpen = false,
  className,
}: AccordionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const contentRef = React.useRef<HTMLDivElement>(null);

  return (
    <div
      className={cn(
        "border border-border rounded-xl overflow-hidden bg-surface",
        className,
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-4 font-medium transition-colors hover:bg-surface-muted/50"
      >
        <span className="text-left text-primary-text">{title}</span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-secondary-text transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-200 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div ref={contentRef} className="p-4 pt-0 border-t border-border">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
