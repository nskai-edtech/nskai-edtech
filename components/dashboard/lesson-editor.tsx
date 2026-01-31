"use client";

import { useState, useEffect } from "react";
import { updateLesson } from "@/actions/chapters";
import { Save, Loader2, Video, RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  position: number;
  isFreePreview: boolean | null;
  createdAt: Date;
  chapterId: string | null;
  muxData?: {
    id: string;
    assetId: string;
    playbackId: string | null;
  } | null;
};

interface LessonEditorProps {
  lesson: Lesson;
  onUpdate: (updatedLesson: Lesson) => void;
}

import { MuxVideoUploader } from "./mux-uploader";
import { VideoPlayer } from "../video-player";

export default function LessonEditor({ lesson, onUpdate }: LessonEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: lesson.title,
    description: lesson.description || "",
    isFreePreview: lesson.isFreePreview || false,
  });

  // Update form data when lesson prop changes
  useEffect(() => {
    setFormData({
      title: lesson.title,
      description: lesson.description || "",
      isFreePreview: lesson.isFreePreview || false,
    });
  }, [lesson]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const result = await updateLesson(lesson.id, {
        title: formData.title,
        description: formData.description || undefined,
        isFreePreview: formData.isFreePreview,
      });

      if (result.error) {
        toast.error(result.error);
      } else if (result.lesson) {
        toast.success("Lesson saved!");
        // Call onUpdate with the updated lesson, preserving muxData relation
        onUpdate({
          ...result.lesson,
          muxData: lesson.muxData,
        } as Lesson);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save lesson");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary-text">Lesson Details</h2>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand/90 disabled:bg-brand/50 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Lesson Title */}
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-primary-text mb-2"
        >
          Lesson Title
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Introduction to LLM Architectures"
          className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand/50"
        />
      </div>

      {/* Video Content */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-primary-text mb-2">
          Video Content
        </label>

        {lesson.muxData?.playbackId ? (
          <div className="space-y-4">
            <VideoPlayer
              playbackId={lesson.muxData.playbackId}
              title={lesson.title}
            />
            <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand/10 rounded-lg">
                  <Video className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary-text">
                    Mux Asset Ready
                  </p>
                  <p className="text-xs text-secondary-text">
                    Asset ID: {lesson.muxData.assetId}
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
        )}

        <div className="flex items-center gap-2 mt-3 p-2 bg-surface-muted/30 rounded-lg">
          <input
            type="checkbox"
            id="freePreview"
            checked={formData.isFreePreview}
            onChange={(e) =>
              setFormData({ ...formData, isFreePreview: e.target.checked })
            }
            className="w-4 h-4 rounded border-border"
          />
          <label htmlFor="freePreview" className="text-sm text-secondary-text">
            Make this lesson available as a free preview
          </label>
        </div>
      </div>

      {/* Lesson Notes */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-primary-text mb-2"
        >
          Lesson Notes
        </label>
        <div className="border border-border rounded-lg overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-1 p-2 bg-surface-muted/50 border-b border-border">
            <button className="p-2 hover:bg-surface rounded text-secondary-text hover:text-primary-text transition-colors">
              <strong className="text-sm">B</strong>
            </button>
            <button className="p-2 hover:bg-surface rounded text-secondary-text hover:text-primary-text transition-colors">
              <em className="text-sm">I</em>
            </button>
            <div className="w-px h-5 bg-border mx-1" />
            <button className="p-2 hover:bg-surface rounded text-secondary-text hover:text-primary-text transition-colors text-sm">
              UL
            </button>
            <button className="p-2 hover:bg-surface rounded text-secondary-text hover:text-primary-text transition-colors text-sm">
              OL
            </button>
            <div className="w-px h-5 bg-border mx-1" />
            <button className="p-2 hover:bg-surface rounded text-secondary-text hover:text-primary-text transition-colors text-sm">
              Code
            </button>
            <button className="p-2 hover:bg-surface rounded text-secondary-text hover:text-primary-text transition-colors text-sm">
              Link
            </button>
          </div>

          {/* Editor */}
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Start writing your lesson content or use AI to generate a draft..."
            rows={12}
            className="w-full px-4 py-3 bg-surface text-primary-text placeholder:text-secondary-text focus:outline-none resize-none"
          />
        </div>
        <p className="text-xs text-secondary-text mt-2 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
            Auto-saved
          </span>
        </p>
      </div>
    </div>
  );
}
