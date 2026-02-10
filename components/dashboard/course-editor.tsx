"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Trash2,
  Eye,
  Menu,
  X,
  Loader2,
  List,
  AlertCircle,
} from "lucide-react";
import {
  createChapter,
  createLesson,
  deleteChapter,
  deleteLesson,
} from "@/actions/chapters";
import { submitCourseForReview, getCourseStatus } from "@/actions/courses";
import toast from "react-hot-toast";
import LessonEditor from "./lesson-editor";
import CourseDetailsForm from "./course-details-form";
import InputModal from "../ui/input-modal";

import { Course, Lesson } from "@/types";

interface CourseEditorProps {
  course: Course;
}

export default function CourseEditor({
  course: initialCourse,
}: CourseEditorProps) {
  const router = useRouter();
  const [course, setCourse] = useState(initialCourse);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set(),
  );
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "chapter" | "lesson" | null;
    chapterId?: string;
  }>({ isOpen: false, type: null });

  // Sync internal state with prop from server
  useEffect(() => {
    setCourse(initialCourse);
  }, [initialCourse]);

  // Poll for status updates when course is pending approval
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (course.status === "PENDING") {
      interval = setInterval(async () => {
        try {
          const result = await getCourseStatus(course.id);
          if (result.status === "PUBLISHED") {
            toast.success("Course approved and published!");
            // Update local state first to show immediate visual feedback
            setCourse((prev) => ({
              ...prev,
              status: "PUBLISHED",
              isPublished: true,
            }));
            // Give the user a moment to see the change then redirect
            setTimeout(() => {
              router.push("/tutor/courses");
              router.refresh();
            }, 2000);
          } else if (result.status === "REJECTED") {
            toast.error("Course submission was rejected.");
            setCourse((prev) => ({ ...prev, status: "REJECTED" }));
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 5000); // Poll every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [course.id, course.status, router]);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  const handleAddChapter = async (title: string) => {
    const result = await createChapter(course.id, title);
    if (result.error) {
      toast.error(result.error);
    } else if (result.chapter) {
      // Optimistically update state
      setCourse((prev) => ({
        ...prev,
        chapters: [
          ...prev.chapters,
          {
            ...result.chapter,
            lessons: [],
          },
        ].sort((a, b) => a.position - b.position),
      }));
      toast.success("Chapter created!");
      setExpandedChapters((prev) => new Set(prev).add(result.chapter.id));
    }
  };

  const handleAddLesson = async (chapterId: string, title: string) => {
    const result = await createLesson(chapterId, title);
    if (result.error) {
      toast.error(result.error);
    } else if (result.lesson) {
      // Optimistically update state
      setCourse((prev) => ({
        ...prev,
        chapters: prev.chapters.map((chapter) =>
          chapter.id === chapterId
            ? {
                ...chapter,
                lessons: [
                  ...chapter.lessons,
                  { ...result.lesson, muxData: null },
                ].sort((a, b) => a.position - b.position),
              }
            : chapter,
        ),
      }));
      toast.success("Lesson created!");
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm("Delete this chapter and all its lessons?")) return;

    const result = await deleteChapter(chapterId);
    if (result.error) {
      toast.error(result.error);
    } else {
      // Optimistically update state
      setCourse((prev) => ({
        ...prev,
        chapters: prev.chapters.filter((c) => c.id !== chapterId),
      }));
      toast.success("Chapter deleted");
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Delete this lesson?")) return;

    const result = await deleteLesson(lessonId);
    if (result.error) {
      toast.error(result.error);
    } else {
      // Optimistically update state
      setCourse((prev) => ({
        ...prev,
        chapters: prev.chapters.map((chapter) => ({
          ...chapter,
          lessons: chapter.lessons.filter((l) => l.id !== lessonId),
        })),
      }));
      if (selectedLesson?.id === lessonId) {
        setSelectedLesson(null);
      }
      toast.success("Lesson deleted");
    }
  };

  const handlePublishToggle = async () => {
    if (course.status === "PENDING") {
      toast.error("Course is already pending approval");
      return;
    }

    if (course.status === "PUBLISHED") {
      // Allow unpublishing if already published?
      toast.error("Course is already published");
      return;
    }

    setIsPublishing(true);
    try {
      const result = await submitCourseForReview(course.id);

      if (result.error) {
        toast.error(result.error);
      } else {
        setCourse((prev) => ({
          ...prev,
          status: "PENDING",
        }));
        toast.success("Course submitted for review!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit course");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleLessonUpdate = (updatedLesson: Lesson) => {
    setCourse((prev) => ({
      ...prev,
      chapters: prev.chapters.map((chapter) => ({
        ...chapter,
        lessons: chapter.lessons.map((lesson) =>
          lesson.id === updatedLesson.id ? updatedLesson : lesson,
        ),
      })),
    }));
    setSelectedLesson(updatedLesson);
  };

  const handleCourseUpdate = (updatedCourse: Partial<Course>) => {
    setCourse((prev) => ({
      ...prev,
      ...updatedCourse,
      chapters: prev.chapters,
    }));
  };

  const handleModalSubmit = async (value: string) => {
    if (modalState.type === "chapter") {
      await handleAddChapter(value);
    } else if (modalState.type === "lesson" && modalState.chapterId) {
      await handleAddLesson(modalState.chapterId, value);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed left-4 top-4 z-50 lg:hidden p-2 bg-surface rounded-lg border border-border text-primary-text hover:bg-surface-muted"
      >
        {isSidebarOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Curriculum Sidebar */}
      <aside
        className={`w-80 border-r border-border bg-surface flex flex-col fixed lg:static inset-y-0 left-0 z-40 transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div
          className="p-4 pt-20 lg:pt-4 border-b border-border cursor-pointer hover:bg-surface-muted transition-colors group"
          onClick={() => setSelectedLesson(null)}
        >
          <h2 className="text-sm font-semibold text-secondary-text uppercase tracking-wider mb-2 group-hover:text-brand transition-colors">
            Curriculum Editor
          </h2>
          <h3 className="text-lg font-bold text-primary-text truncate">
            {course.title}
          </h3>
          <p className="text-xs text-secondary-text mt-1">
            {course.chapters?.length ?? 0}{" "}
            {(course.chapters?.length ?? 0) === 1 ? "Module" : "Modules"}
          </p>
        </div>

        {/* Chapters List */}
        <div className="flex-1 overflow-y-auto p-3">
          {course.chapters.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p className="text-sm text-secondary-text mb-4">
                No modules yet. Add your first module to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {course.chapters.map((chapter, chapterIndex) => (
                <div key={chapter.id}>
                  {/* Chapter */}
                  <div className="group flex items-center gap-2 p-2 rounded-lg hover:bg-surface-muted transition-colors">
                    <button
                      onClick={() => toggleChapter(chapter.id)}
                      className="flex items-center gap-2 flex-1 text-left"
                    >
                      {expandedChapters.has(chapter.id) ? (
                        <ChevronDown className="w-4 h-4 text-secondary-text" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-secondary-text" />
                      )}
                      <span className="text-xs font-semibold text-secondary-text">
                        Module {chapterIndex + 1}
                      </span>
                      <span className="text-sm font-medium text-primary-text truncate">
                        {chapter.title}
                      </span>
                    </button>
                    <button
                      onClick={() => handleDeleteChapter(chapter.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 rounded transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>

                  {/* Lessons */}
                  {expandedChapters.has(chapter.id) && (
                    <div className="ml-6 mt-1 space-y-1">
                      {chapter.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          onClick={() => {
                            setSelectedLesson(lesson);
                            setIsSidebarOpen(false);
                          }}
                          className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                            selectedLesson?.id === lesson.id
                              ? "bg-brand text-white"
                              : "hover:bg-surface-muted"
                          }`}
                        >
                          <GripVertical className="w-3.5 h-3.5 opacity-50" />
                          <span className="text-xs font-medium flex-1 truncate">
                            {lessonIndex + 1}. {lesson.title}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLesson(lesson.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 rounded transition-all"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </button>
                        </div>
                      ))}

                      <button
                        onClick={() =>
                          setModalState({
                            isOpen: true,
                            type: "lesson",
                            chapterId: chapter.id,
                          })
                        }
                        className="flex items-center gap-2 w-full p-2 text-xs text-brand hover:bg-brand/5 rounded-lg transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Lesson
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Module Button */}
        <div className="p-3 border-t border-border">
          <button
            onClick={() => setModalState({ isOpen: true, type: "chapter" })}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Module
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:ml-0">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-surface">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-primary-text">
              {selectedLesson ? "Lesson Details" : "Course Overview"}
            </h1>
            {selectedLesson && (
              <span className="text-sm text-secondary-text">
                Editing: {selectedLesson.title}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium text-secondary-text hover:text-primary-text transition-colors">
              Preview
            </button>
            <button
              onClick={handlePublishToggle}
              disabled={
                isPublishing ||
                course.status === "PENDING" ||
                course.status === "PUBLISHED"
              }
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                course.status === "PUBLISHED"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  : course.status === "PENDING"
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                    : course.status === "REJECTED"
                      ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                      : "bg-brand/10 text-brand hover:bg-brand/20"
              }`}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  {course.status === "PUBLISHED" ? (
                    <>
                      <Eye className="w-4 h-4" />
                      Published
                    </>
                  ) : course.status === "PENDING" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Pending Approval
                    </>
                  ) : course.status === "REJECTED" ? (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      Rejected - Resubmit
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Publish Course
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedLesson ? (
            <LessonEditor
              lesson={selectedLesson}
              onUpdate={handleLessonUpdate}
            />
          ) : (
            <CourseDetailsForm course={course} onUpdate={handleCourseUpdate} />
          )}
        </div>

        {/* Floating View Courses Button */}
        <button
          onClick={() => router.push("/tutor/courses")}
          className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 bg-brand hover:bg-brand/90 text-white rounded-full font-medium shadow-lg transition-all hover:shadow-xl hover:scale-105"
        >
          <List className="w-5 h-5" />
          <span className="hidden sm:inline">View All Courses</span>
        </button>
      </main>

      {/* Input Modal */}
      <InputModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, type: null })}
        onSubmit={handleModalSubmit}
        title={
          modalState.type === "chapter"
            ? "Create New Module"
            : "Create New Lesson"
        }
        placeholder={
          modalState.type === "chapter"
            ? "Enter module title..."
            : "Enter lesson title..."
        }
        submitLabel="Create"
      />
    </div>
  );
}
