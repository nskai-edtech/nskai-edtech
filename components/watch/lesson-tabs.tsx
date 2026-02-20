"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

import { NotesPanel } from "@/components/learner/notes-panel";

import { QaSection } from "@/components/watch/qa-section";

interface Lesson {
  id: string;
  description: string | null;
  notes: string | null;
}

import { QuestionWithRelations } from "@/types";

interface LessonTabsProps {
  lesson: Lesson;
  lessonId: string;
  tutorNotes: string | null;
  questions: QuestionWithRelations[];
}

export const LessonTabs = ({
  lesson,
  lessonId,
  tutorNotes,
  questions,
}: LessonTabsProps) => {
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
          count={questions.length}
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
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <QaSection lessonId={lessonId} questions={questions} />
          </div>
        )}

        {activeTab === "notes" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <NotesPanel lessonId={lessonId} tutorNotes={tutorNotes} />
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
