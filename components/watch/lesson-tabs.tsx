"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Lesson {
  description: string | null;
}

interface LessonTabsProps {
  lesson: Lesson;
}

export const LessonTabs = ({ lesson }: LessonTabsProps) => {
  const [activeTab, setActiveTab] = useState<"overview" | "qa" | "notes">(
    "overview",
  );

  return (
    <div className="mt-8">
      <div className="flex gap-6 border-b border-border mb-6">
        <TabButton
          label="Overview"
          isActive={activeTab === "overview"}
          onClick={() => setActiveTab("overview")}
        />
        <TabButton
          label="Q&A"
          isActive={activeTab === "qa"}
          onClick={() => setActiveTab("qa")}
          count={12}
        />
        <TabButton
          label="Notes"
          isActive={activeTab === "notes"}
          onClick={() => setActiveTab("notes")}
        />
      </div>

      <div className="min-h-[200px]">
        {activeTab === "overview" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-xl font-bold text-primary-text mb-4">
              About this lesson
            </h3>
            <div
              className="prose dark:prose-invert max-w-none text-secondary-text"
              dangerouslySetInnerHTML={{
                __html:
                  lesson.description ||
                  "<p>No description provided for this lesson.</p>",
              }}
            />
          </div>
        )}

        {activeTab === "qa" && (
          <div className="flex flex-col items-center justify-center h-40 text-secondary-text animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p>Q&A feature coming soon!</p>
          </div>
        )}

        {activeTab === "notes" && (
          <div className="flex flex-col items-center justify-center h-40 text-secondary-text animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p>Notes feature coming soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  count?: number;
}

const TabButton = ({ label, isActive, onClick, count }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={cn(
      "pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2",
      isActive
        ? "border-brand text-brand"
        : "border-transparent text-secondary-text hover:text-primary-text",
    )}
  >
    {label}
    {count && (
      <span className="bg-surface-muted text-secondary-text text-[10px] px-2 py-0.5 rounded-full border border-border">
        {count}
      </span>
    )}
  </button>
);
