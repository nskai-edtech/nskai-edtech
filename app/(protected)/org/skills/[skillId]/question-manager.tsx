"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Pencil,
  Loader2,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  createAssessmentQuestion,
  updateAssessmentQuestion,
  deleteAssessmentQuestion,
} from "@/actions/skills/assessments-admin";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import type { AssessmentQuestion } from "@/actions/skills/types";

const DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

type QuestionFormData = {
  questionText: string;
  options: string[];
  correctOption: number;
  difficulty: string;
};

const EMPTY_FORM: QuestionFormData = {
  questionText: "",
  options: ["", "", "", ""],
  correctOption: 0,
  difficulty: "BEGINNER",
};

export function QuestionManager({
  skillId,
  initialQuestions,
}: {
  skillId: string;
  initialQuestions: AssessmentQuestion[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<QuestionFormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ─── Create ───
  const handleCreate = async () => {
    const filteredOptions = form.options.filter((o) => o.trim());
    if (!form.questionText.trim() || filteredOptions.length < 2) {
      toast.error("Question text and at least 2 options are required");
      return;
    }
    if (form.correctOption >= filteredOptions.length) {
      toast.error("Select a valid correct answer");
      return;
    }

    setIsSubmitting(true);
    const res = await createAssessmentQuestion({
      skillId,
      questionText: form.questionText.trim(),
      options: filteredOptions,
      correctOption: form.correctOption,
      difficulty: form.difficulty,
    });
    setIsSubmitting(false);

    if ("error" in res && res.error) {
      toast.error(res.error as string);
      return;
    }

    toast.success("Question created!");
    setForm(EMPTY_FORM);
    setShowForm(false);
    router.refresh();
  };

  // ─── Update ───
  const startEdit = (q: AssessmentQuestion) => {
    setEditingId(q.id);
    setForm({
      questionText: q.questionText,
      options: [...q.options, ...(q.options.length < 4 ? [""] : [])],
      correctOption: q.correctOption,
      difficulty: q.difficulty || "BEGINNER",
    });
    setShowForm(false);
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    const filteredOptions = form.options.filter((o) => o.trim());
    if (!form.questionText.trim() || filteredOptions.length < 2) {
      toast.error("Question text and at least 2 options are required");
      return;
    }

    setIsSubmitting(true);
    const res = await updateAssessmentQuestion(editingId, {
      questionText: form.questionText.trim(),
      options: filteredOptions,
      correctOption: form.correctOption,
      difficulty: form.difficulty,
    });
    setIsSubmitting(false);

    if ("error" in res && res.error) {
      toast.error(res.error as string);
      return;
    }

    toast.success("Question updated!");
    setEditingId(null);
    setForm(EMPTY_FORM);
    router.refresh();
  };

  // ─── Delete ───
  const handleDelete = async (questionId: string) => {
    setDeletingId(questionId);
    const res = await deleteAssessmentQuestion(questionId);
    setDeletingId(null);

    if ("error" in res && res.error) {
      toast.error(res.error as string);
      return;
    }

    toast.success("Question deleted");
    router.refresh();
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const setOption = (index: number, value: string) => {
    setForm((prev) => {
      const newOpts = [...prev.options];
      newOpts[index] = value;
      return { ...prev, options: newOpts };
    });
  };

  const addOption = () => {
    if (form.options.length >= 6) return;
    setForm((prev) => ({ ...prev, options: [...prev.options, ""] }));
  };

  const removeOption = (index: number) => {
    if (form.options.length <= 2) return;
    setForm((prev) => {
      const newOpts = prev.options.filter((_, i) => i !== index);
      let correctOpt = prev.correctOption;
      if (correctOpt >= index && correctOpt > 0) correctOpt--;
      return { ...prev, options: newOpts, correctOption: correctOpt };
    });
  };

  // ─── Form UI (shared by create & edit) ───
  const renderForm = (isEditing: boolean) => (
    <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-primary-text">
          {isEditing ? "Edit Question" : "New Question"}
        </h3>
        <button
          type="button"
          onClick={cancelForm}
          className="p-1 rounded-md hover:bg-surface-muted"
        >
          <X className="w-5 h-5 text-secondary-text" />
        </button>
      </div>

      {/* Question Text */}
      <div>
        <label className="block text-sm font-medium text-primary-text mb-1">
          Question *
        </label>
        <textarea
          value={form.questionText}
          onChange={(e) =>
            setForm((p) => ({ ...p, questionText: e.target.value }))
          }
          rows={3}
          placeholder="Enter the question..."
          className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand/50 resize-none"
        />
      </div>

      {/* Difficulty */}
      <div>
        <label className="block text-sm font-medium text-primary-text mb-1">
          Difficulty
        </label>
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setForm((p) => ({ ...p, difficulty: d }))}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                form.difficulty === d
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-border text-secondary-text hover:border-brand/30",
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div>
        <label className="block text-sm font-medium text-primary-text mb-2">
          Options * (click to mark correct)
        </label>
        <div className="space-y-2">
          {form.options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, correctOption: idx }))}
                className={cn(
                  "shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors",
                  form.correctOption === idx
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-border text-secondary-text hover:border-green-500/50",
                )}
                title={
                  form.correctOption === idx
                    ? "Correct answer"
                    : "Mark as correct"
                }
              >
                {form.correctOption === idx ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-xs">
                    {String.fromCharCode(65 + idx)}
                  </span>
                )}
              </button>
              <input
                value={opt}
                onChange={(e) => setOption(idx, e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand/50"
              />
              {form.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(idx)}
                  className="p-1.5 rounded-md hover:bg-red-500/10 text-secondary-text hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {form.options.length < 6 && (
          <button
            type="button"
            onClick={addOption}
            className="mt-2 text-xs text-brand hover:text-brand/80 font-medium"
          >
            + Add Option
          </button>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={cancelForm}
          className="px-4 py-2 text-sm text-secondary-text hover:text-primary-text"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={isEditing ? handleUpdate : handleCreate}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg font-medium hover:bg-brand/90 disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEditing ? "Save Changes" : "Add Question"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Add Question Button */}
      {!showForm && !editingId && (
        <button
          type="button"
          onClick={() => {
            setForm(EMPTY_FORM);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-lg font-medium hover:bg-brand/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Question
        </button>
      )}

      {/* Create Form */}
      {showForm && renderForm(false)}

      {/* Question List */}
      {initialQuestions.length === 0 && !showForm ? (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <AlertCircle className="w-8 h-8 text-secondary-text mx-auto mb-3" />
          <p className="text-secondary-text">
            No assessment questions yet. Add questions to enable diagnostic
            assessments for this skill.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {initialQuestions.map((q, qIdx) =>
            editingId === q.id ? (
              renderForm(true)
            ) : (
              <div
                key={q.id}
                className="bg-surface border border-border rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-secondary-text bg-surface-muted px-2 py-0.5 rounded">
                        Q{qIdx + 1}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded",
                          q.difficulty === "ADVANCED"
                            ? "bg-red-500/10 text-red-500"
                            : q.difficulty === "INTERMEDIATE"
                              ? "bg-amber-500/10 text-amber-500"
                              : "bg-green-500/10 text-green-500",
                        )}
                      >
                        {q.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-primary-text font-medium mb-3">
                      {q.questionText}
                    </p>
                    <div className="grid gap-1.5 sm:grid-cols-2">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={cn(
                            "flex items-center gap-2 text-xs px-3 py-2 rounded-lg border",
                            optIdx === q.correctOption
                              ? "border-green-500/50 bg-green-500/5 text-green-600"
                              : "border-border text-secondary-text",
                          )}
                        >
                          <span className="font-medium">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <span>{opt}</span>
                          {optIdx === q.correctOption && (
                            <Check className="w-3.5 h-3.5 ml-auto text-green-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(q)}
                      className="p-1.5 rounded-md hover:bg-surface-muted text-secondary-text hover:text-primary-text transition-colors"
                      title="Edit question"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(q.id)}
                      disabled={deletingId === q.id}
                      className="p-1.5 rounded-md hover:bg-red-500/10 text-secondary-text hover:text-red-500 transition-colors disabled:opacity-50"
                      title="Delete question"
                    >
                      {deletingId === q.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
