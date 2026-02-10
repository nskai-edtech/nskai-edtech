"use client";

import { cn } from "@/lib/utils";
import { Lock, PlayCircle, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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

interface CourseSidebarProps {
  course: SidebarCourse;
  currentLessonId: string;
  purchase: boolean; // whether user has access
}

export const CourseSidebar = ({
  course,
  currentLessonId,
  purchase,
}: CourseSidebarProps) => {
  return (
    <div className="h-full border-r border-border bg-surface flex flex-col overflow-y-auto">
      <div className="p-6 border-b border-border">
        <h2 className="font-bold text-lg text-primary-text line-clamp-2">
          {course.title}
        </h2>
        {/* Progress Bar Placeholder */}
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1 text-secondary-text font-semibold">
            <span>Course Progress</span>
            <span>0%</span>
          </div>
          <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden">
            <div className="h-full bg-brand w-0 rounded-full" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {course.chapters.map((chapter) => (
          <ChapterItem
            key={chapter.id}
            chapter={chapter}
            courseId={course.id}
            currentLessonId={currentLessonId}
            hasAccess={purchase}
          />
        ))}
      </div>
    </div>
  );
};

interface ChapterItemProps {
  chapter: SidebarChapter;
  courseId: string;
  currentLessonId: string;
  hasAccess: boolean;
}

const ChapterItem = ({
  chapter,
  courseId,
  currentLessonId,
  hasAccess,
}: ChapterItemProps) => {
  // Check if this chapter contains the current lesson
  const isActiveChapter = chapter.lessons.some(
    (l: SidebarLesson) => l.id === currentLessonId,
  );

  const [isOpen, setIsOpen] = useState(isActiveChapter);

  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-surface-muted/50 transition-colors"
      >
        <h3 className="text-sm font-bold text-primary-text text-left">
          {chapter.title}
        </h3>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-secondary-text" />
        ) : (
          <ChevronDown className="w-4 h-4 text-secondary-text" />
        )}
      </button>

      {isOpen && (
        <div className="flex flex-col pb-2">
          {chapter.lessons.map((lesson) => {
            const isLocked = !lesson.isFreePreview && !hasAccess;
            const isActive = lesson.id === currentLessonId;

            return (
              <Link
                key={lesson.id}
                href={`/watch/${courseId}/${lesson.id}`}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 text-sm transition-all border-l-2",
                  isActive
                    ? "bg-brand/5 border-brand text-brand font-medium"
                    : "border-transparent text-secondary-text hover:text-primary-text hover:bg-surface-muted",
                  isLocked &&
                    "opacity-60 cursor-not-allowed hover:bg-transparent",
                )}
                onClick={(e) => isLocked && e.preventDefault()}
              >
                {isLocked ? (
                  <Lock className="w-4 h-4 shrink-0" />
                ) : isActive ? (
                  <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-brand rounded-full animate-pulse" />
                  </div>
                ) : (
                  <PlayCircle className="w-4 h-4 shrink-0" />
                )}
                <span className="line-clamp-1">{lesson.title}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
