"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { CourseSidebar } from "./course-sidebar";

interface SidebarLesson {
  id: string;
  title: string;
  isFreePreview: boolean | null;
}

interface SidebarChapter {
  id: string;
  title: string;
  lessons: SidebarLesson[];
}

interface SidebarCourse {
  id: string;
  title: string;
  chapters: SidebarChapter[];
}

interface CourseMobileSidebarProps {
  course: SidebarCourse;
  currentLessonId: string;
  purchase: boolean;
}

export function CourseMobileSidebar({
  course,
  currentLessonId,
  purchase,
}: CourseMobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2 hover:bg-surface-muted rounded-full transition-colors text-primary-text"
        title="Course Content"
      >
        <Menu className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Sidebar Drawer */}
          <div className="relative w-4/5 max-w-sm ml-auto h-full bg-surface shadow-2xl animate-in slide-in-from-right flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-bold text-lg text-primary-text">
                Course Content
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-surface-muted rounded-full transition-colors text-secondary-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <CourseSidebar
                course={course}
                currentLessonId={currentLessonId}
                purchase={purchase}
                hideHeader
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
