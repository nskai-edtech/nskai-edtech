"use client";

import { useState } from "react";
import { ChevronDown, PlayCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  isFreePreview: boolean | null;
  position: number;
}

interface Chapter {
  id: string;
  title: string;
  position: number;
  lessons: Lesson[];
}

interface CourseCurriculumProps {
  chapters: Chapter[];
}

export const CourseCurriculum = ({ chapters }: CourseCurriculumProps) => {
  const [openChapters, setOpenChapters] = useState<string[]>([chapters[0]?.id]);

  const toggleChapter = (id: string) => {
    setOpenChapters((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const totalLessons = chapters.reduce((acc, c) => acc + c.lessons.length, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-primary-text">Course Content</h2>
        <span className="text-sm text-secondary-text">
          {chapters.length} chapters • {totalLessons} lessons
        </span>
      </div>

      <div className="border border-border rounded-2xl overflow-hidden bg-surface">
        {chapters
          .sort((a, b) => a.position - b.position)
          .map((chapter) => (
            <div
              key={chapter.id}
              className="border-b border-border last:border-0"
            >
              <button
                onClick={() => toggleChapter(chapter.id)}
                className="w-full flex items-center justify-between p-5 hover:bg-surface-muted transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-secondary-text transition-transform",
                      openChapters.includes(chapter.id) ? "rotate-180" : "",
                    )}
                  />
                  <span className="font-semibold text-primary-text">
                    {chapter.title}
                  </span>
                </div>
                <span className="text-xs text-secondary-text font-medium">
                  {chapter.lessons.length} lessons
                </span>
              </button>

              {openChapters.includes(chapter.id) && (
                <div className="bg-surface-muted/30 px-5 py-2">
                  {chapter.lessons
                    .sort((a, b) => a.position - b.position)
                    .map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between py-3 group"
                      >
                        <div className="flex items-center gap-3">
                          <PlayCircle className="w-4 h-4 text-brand" />
                          <span className="text-sm text-primary-text">
                            {lesson.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {lesson.isFreePreview ? (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand bg-brand/10 px-2 py-0.5 rounded-full">
                              Preview
                            </span>
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-secondary-text/50" />
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};
