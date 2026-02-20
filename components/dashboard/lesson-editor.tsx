/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Video, RefreshCcw, Cloud } from "lucide-react";
import toast from "react-hot-toast";

import { updateLesson } from "@/actions/chapters";
import { Lesson } from "@/types";
import { useDebounce } from "@/hooks/use-debounce";
import { VideoPlayer } from "@/components/video-player";
import { Editor } from "@/components/editor";
import { MuxVideoUploader } from "./mux-uploader";
import { QuizEditor } from "../tutor/quiz-editor";
import { getQuizQuestionsAdmin, QuizQuestionWithAnswer } from "@/actions/quiz";

interface LessonEditorProps {
  lesson: Lesson;
  onUpdate: (updatedLesson: Lesson) => void;
}

export default function LessonEditor({ lesson, onUpdate }: LessonEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: lesson.title,
    description: lesson.description || "",
    isFreePreview: lesson.isFreePreview || false,
    notes: lesson.notes || "",
    type: (lesson.type as "VIDEO" | "QUIZ") || "VIDEO",
  });

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionWithAnswer[]>(
    [],
  );
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // Debounce form data to avoid too many requests
  const debouncedData = useDebounce(formData, 3000);

  // Keep track of last saved data to only save on changes
  const lastSavedData = useRef(formData);

  // Keep track of first render to avoid auto-saving on mount
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const initialData = {
      title: lesson.title,
      description: lesson.description || "",
      isFreePreview: lesson.isFreePreview || false,
      notes: lesson.notes || "",
      type: (lesson.type as "VIDEO" | "QUIZ") || "VIDEO",
    };
    setFormData(initialData);
    lastSavedData.current = initialData; // Reset saved state when switching lessons
  }, [lesson.id, lesson.type]); // Only reset when switching lessons, not on internal updates

  // Fetch quiz questions if type is quiz
  useEffect(() => {
    const fetchQuestions = async () => {
      if (formData.type === "QUIZ") {
        setIsLoadingQuestions(true);
        const res = await getQuizQuestionsAdmin(lesson.id);
        if ("questions" in res) {
          setQuizQuestions(res.questions);
        }
        setIsLoadingQuestions(false);
      }
    };
    fetchQuestions();
  }, [lesson.id, formData.type]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Only save if data has actually changed from what we last saved
    if (
      JSON.stringify(debouncedData) === JSON.stringify(lastSavedData.current)
    ) {
      return;
    }

    const save = async () => {
      setIsSaving(true);
      try {
        const result = await updateLesson(lesson.id, {
          title: debouncedData.title,
          description: debouncedData.description || undefined,
          isFreePreview: debouncedData.isFreePreview,
          notes: debouncedData.notes || undefined,
          type: debouncedData.type,
        });

        if (result.error) {
          toast.error(result.error);
        } else if (result.lesson) {
          // Update last saved reference
          lastSavedData.current = debouncedData;

          // Silent success or subtle indicator
          onUpdate({
            ...result.lesson,
            muxData: lesson.muxData,
          } as Lesson);
        }
      } catch (error) {
        console.error("Auto-save failed:", error);
        toast.error("Auto-save failed");
      } finally {
        setIsSaving(false);
      }
    };

    save();
  }, [debouncedData]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 z-20 bg-background/80 backdrop-blur pb-4 pt-2 border-b border-border/50 lg:border-none mb-6 lg:mb-0">
        <h2 className="text-2xl font-bold text-primary-text">Lesson Details</h2>

        <div className="flex items-center gap-2">
          {isSaving ? (
            <div className="flex items-center gap-2 text-primary-text bg-surface border border-border px-3 py-1.5 rounded-full text-xs font-medium animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              Auto saving...
            </div>
          ) : (
            <div className="flex items-center gap-2 text-secondary-text bg-surface-muted border border-border px-3 py-1.5 rounded-full text-xs font-medium">
              <Cloud className="w-3 h-3" />
              Saved
            </div>
          )}
        </div>
      </div>

      {/* Lesson Title */}
      <div className="bg-surface p-6 rounded-xl border border-border">
        <label
          htmlFor="title"
          className="block text-sm font-bold text-primary-text mb-2"
        >
          Lesson Title
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Introduction to LLM Architectures"
          className="w-full px-4 py-3 bg-background border border-border rounded-lg text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all font-medium text-lg"
        />
      </div>

      {/* Lesson Type Switcher */}
      <div className="bg-surface p-6 rounded-xl border border-border">
        <label className="block text-sm font-bold text-primary-text mb-4">
          Lesson Type
        </label>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setFormData({ ...formData, type: "VIDEO" })}
            className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
              formData.type === "VIDEO"
                ? "border-brand bg-brand/5 text-brand"
                : "border-border hover:border-brand/50 text-secondary-text"
            }`}
          >
            <Video className="w-6 h-6 mb-2" />
            <span className="font-semibold text-sm">Video Lesson</span>
          </button>
          <button
            onClick={() => setFormData({ ...formData, type: "QUIZ" })}
            className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
              formData.type === "QUIZ"
                ? "border-brand bg-brand/5 text-brand"
                : "border-border hover:border-brand/50 text-secondary-text"
            }`}
          >
            <Cloud className="w-6 h-6 mb-2" />
            <span className="font-semibold text-sm">Quiz / Assessment</span>
          </button>
        </div>
      </div>

      {formData.type === "VIDEO" ? (
        /* Video Content */
        <div className="bg-surface p-6 rounded-xl border border-border">
          <label className="block text-sm font-bold text-primary-text mb-4">
            Video Content
          </label>

          {lesson.muxData?.playbackId ? (
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden shadow-lg border border-border/50">
                <VideoPlayer
                  playbackId={lesson.muxData.playbackId}
                  title={lesson.title}
                />
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-background border border-border rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Video className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary-text">
                      Video Processed & Ready
                    </p>
                    <p className="text-xs text-secondary-text font-mono">
                      ID: {lesson.muxData.assetId.substring(0, 8)}...
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.refresh()}
                    className="p-2 hover:bg-surface-muted rounded-lg transition-colors text-secondary-text"
                    title="Refresh status"
                  >
                    <RefreshCcw className="w-4 h-4" />
                  </button>
                  <MuxVideoUploader
                    lessonId={lesson.id}
                    onSuccess={(assetId, playbackId) => {
                      onUpdate({
                        ...lesson,
                        muxData: {
                          id: lesson.muxData?.id || "temp",
                          assetId,
                          playbackId,
                        },
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center bg-surface-muted/20">
              <div className="mb-4 p-4 bg-surface rounded-full shadow-sm">
                <Video className="w-8 h-8 text-secondary-text" />
              </div>
              <p className="text-primary-text font-medium mb-2">
                No video uploaded
              </p>
              <p className="text-sm text-secondary-text mb-6 text-center max-w-sm">
                Upload a video lesson for your students to watch.
              </p>
              <MuxVideoUploader
                lessonId={lesson.id}
                onSuccess={(assetId, playbackId) => {
                  onUpdate({
                    ...lesson,
                    muxData: {
                      id: "temp",
                      assetId,
                      playbackId,
                    },
                  });
                }}
              />
            </div>
          )}

          <div className="flex items-center gap-3 mt-6 p-4 bg-brand/5 border border-brand/10 rounded-xl">
            <input
              type="checkbox"
              id="freePreview"
              checked={formData.isFreePreview}
              onChange={(e) =>
                setFormData({ ...formData, isFreePreview: e.target.checked })
              }
              className="w-5 h-5 rounded border-border text-brand focus:ring-brand"
            />
            <div className="flex flex-col">
              <label
                htmlFor="freePreview"
                className="text-sm font-medium text-primary-text"
              >
                Free Preview
              </label>
              <label
                htmlFor="freePreview"
                className="text-xs text-secondary-text"
              >
                Allow students to watch this lesson without purchasing the
                course.
              </label>
            </div>
          </div>
        </div>
      ) : (
        /* Quiz Content */
        <div className="bg-surface p-6 rounded-xl border border-border">
          <label className="block text-sm font-bold text-primary-text mb-4">
            Quiz Builder
          </label>
          {isLoadingQuestions ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-brand" />
            </div>
          ) : (
            <QuizEditor lessonId={lesson.id} initialQuestions={quizQuestions} />
          )}
        </div>
      )}

      {/* Lesson Description (Rich Text) */}
      <div className="bg-surface p-6 rounded-xl border border-border">
        <label className="block text-sm font-bold text-primary-text mb-2">
          Lesson Description
        </label>
        <p className="text-xs text-secondary-text mb-4">
          A detailed overview of what students will learn in this lesson.
        </p>
        <Editor
          value={formData.description}
          onChange={(val) =>
            setFormData((prev) => ({ ...prev, description: val }))
          }
        />
      </div>

      {/* Lesson Notes (Rich Text) */}
      <div className="bg-surface p-6 rounded-xl border border-border">
        <label className="block text-sm font-bold text-primary-text mb-2">
          Lesson Notes & Resources
        </label>
        <p className="text-xs text-secondary-text mb-4">
          Add code snippets, downloadable resources (PDFs), or supplementary
          links.
        </p>
        <Editor
          value={formData.notes}
          onChange={(val) => setFormData((prev) => ({ ...prev, notes: val }))}
        />
      </div>
    </div>
  );
}
