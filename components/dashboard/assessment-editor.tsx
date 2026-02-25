"use client";

import { useState } from "react";
import { upsertAssignment } from "@/actions/assessments/actions";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Editor } from "@/components/editor";
import { Assignment } from "@/types";

interface AssessmentEditorProps {
  lessonId: string;
  initialAssignment?: Assignment | null;
}

export const AssessmentEditor = ({
  lessonId,
  initialAssignment,
}: AssessmentEditorProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: initialAssignment?.title || "",
    description: initialAssignment?.description || "",
    maxScore: initialAssignment?.maxScore || 100,
  });

  const handleSave = async () => {
    if (!formData.title) {
      toast.error("Assignment title is required");
      return;
    }

    setIsSaving(true);
    try {
      const result = await upsertAssignment(lessonId, formData);
      if (result.error) toast.error(result.error);
      else toast.success("Assessment saved successfully!");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-primary-text">
            Project Assessment
          </h3>
          <p className="text-sm text-secondary-text">
            Create an assessment or project for this lesson.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Assessment
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-primary-text">
          Assignment Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g. Build a Web App"
          className="w-full px-4 py-2 bg-background border border-border rounded-lg text-primary-text focus:outline-none focus:ring-2 focus:ring-brand/50"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-primary-text">
          Max Score
        </label>
        <input
          type="number"
          value={formData.maxScore}
          onChange={(e) =>
            setFormData({
              ...formData,
              maxScore: parseInt(e.target.value) || 0,
            })
          }
          className="w-full px-4 py-2 bg-background border border-border rounded-lg text-primary-text focus:outline-none focus:ring-2 focus:ring-brand/50"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-primary-text">
          Instructions
        </label>
        <Editor
          value={formData.description}
          onChange={(val) => setFormData({ ...formData, description: val })}
        />
      </div>
    </div>
  );
};
