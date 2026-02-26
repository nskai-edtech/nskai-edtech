"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertAssignment } from "@/actions/assessments/actions";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Editor } from "@/components/editor";
import { Assignment } from "@/types";
import { AiGenerateButton } from "@/components/ui/ai-generate-button";

interface AssessmentEditorProps {
  lessonId: string;
  initialAssignment?: Assignment | null;
}

export const AssessmentEditor = ({
  lessonId,
  initialAssignment,
}: AssessmentEditorProps) => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: initialAssignment?.title || "",
    description: initialAssignment?.description || "",
    maxScore: initialAssignment?.maxScore || 100,
  });

  // --- NEW AI GENERATION FUNCTION ---
  const handleGenerateAssessment = async () => {
    // TODO: Replace with real Python API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulated AI response giving us all 3 fields at once
    const aiSuggestion = {
      title: "Build a Secure Database Setup",
      maxScore: 100,
      description:
        "<h3>Project Overview</h3><p>Design a secure database setup using AsyncPG and Docker.</p><h4>Requirements:</h4><ul><li>Create a Docker container that exposes port 5432.</li><li>Store the connection string as an environment variable.</li><li>Implement a simple async query and test its performance.</li></ul><p><strong>Deliverable:</strong> Submit your GitHub repository link and a screenshot of your successful query execution.</p>",
    };

    setFormData(aiSuggestion);
    toast.success("Assessment draft generated!");
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast.error("Assignment title is required");
      return;
    }

    setIsSaving(true);
    try {
      const result = await upsertAssignment(lessonId, formData);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Assessment saved successfully!");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-primary-text">
            Project Assessment
          </h3>
          <p className="text-sm text-secondary-text">
            Create an assessment or project for this lesson.
          </p>
        </div>

        {/* ---  AI BUTTON HERE --- */}
        <div className="flex items-center gap-3">
          <AiGenerateButton
            onGenerate={handleGenerateAssessment}
            label="Draft Assessment"
          />
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Assessment
          </button>
        </div>
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
