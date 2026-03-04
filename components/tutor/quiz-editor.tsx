"use client";

import { useState, useTransition, useEffect } from "react";
import { PlusCircle, Trash2, Save, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { QuizQuestionWithAnswer } from "@/actions/quiz/types";
import { deleteQuizQuestion, saveQuizQuestion } from "@/actions/quiz/actions";
import { AiGenerateButton } from "@/components/ui/ai-generate-button";

interface QuizEditorProps {
  lessonId: string;
  initialQuestions: QuizQuestionWithAnswer[];
}

function QuestionForm({
  lessonId,
  question,
  position,
  onSaved,
  onCancel,
}: {
  lessonId: string;
  question?: QuizQuestionWithAnswer;
  position: number;
  onSaved: (saved: QuizQuestionWithAnswer) => void;
  onCancel?: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [questionText, setQuestionText] = useState(
    question?.questionText ?? "",
  );
  const [options, setOptions] = useState<string[]>(
    question?.options ?? ["", "", "", ""],
  );
  const [correctOption, setCorrectOption] = useState<number>(
    question?.correctOption ?? 0,
  );

  function updateOption(index: number, value: string) {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function handleSave() {
    if (!questionText.trim()) {
      toast.error("Question text is required.");
      return;
    }
    if (options.some((o) => !o.trim())) {
      toast.error("All options must be filled in.");
      return;
    }

    startTransition(async () => {
      const res = await saveQuizQuestion(
        lessonId,
        { questionText, options, correctOption, position },
        question?.id,
      );
      if (res.error) {
        toast.error(res.error);
      } else if (res.question) {
        toast.success("Question saved!");
        onSaved(res.question);
      }
    });
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
      <textarea
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        placeholder="Question text..."
        rows={2}
        className="w-full bg-surface-muted border border-border rounded-xl px-4 py-2 text-sm text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand resize-none"
      />
      <div className="grid gap-2">
        {options.map((opt, oi) => (
          <div key={oi} className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCorrectOption(oi)}
              className={cn(
                "shrink-0 w-5 h-5 rounded-full border-2 transition-colors",
                correctOption === oi
                  ? "border-green-500 bg-green-500"
                  : "border-border",
              )}
              aria-label={`Mark option ${String.fromCharCode(65 + oi)} as correct`}
            />
            <input
              value={opt}
              onChange={(e) => updateOption(oi, e.target.value)}
              placeholder={`Option ${String.fromCharCode(65 + oi)}`}
              className="flex-1 bg-surface-muted border border-border rounded-xl px-4 py-2 text-sm text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        ))}
        <p className="text-xs text-secondary-text">
          Click the circle to mark the correct answer.
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand/90 disabled:opacity-50 transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          {isPending ? "Saving..." : "Save Question"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-muted border border-border text-sm font-semibold text-secondary-text hover:bg-surface/80"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export function QuizEditor({ lessonId, initialQuestions }: QuizEditorProps) {
  const [questions, setQuestions] =
    useState<QuizQuestionWithAnswer[]>(initialQuestions);
  const [adding, setAdding] = useState(false);
  const [enhancingIndex, setEnhancingIndex] = useState<number | null>(null);
  const [enhanceDraft, setEnhanceDraft] =
    useState<QuizQuestionWithAnswer | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedDrafts, setGeneratedDrafts] = useState<
    QuizQuestionWithAnswer[]
  >([]);
  const [isPending, startTransition] = useTransition();
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [rawModal, setRawModal] = useState<{
    open: boolean;
    text: string;
  } | null>(null);

  // Only sync on initial mount — not on every refresh
  useEffect(() => {
    setQuestions(initialQuestions);
  }, [initialQuestions]);

  // --- Enhance a single question ---
  const handleEnhance = async (index: number) => {
    setEnhancingIndex(index);
    setEnhanceDraft(null);
    try {
      const q = questions[index];
      const res = await fetch("/api/ai/enhance-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "enhance",
          questionText: q.questionText,
          options: q.options,
          correctOption: q.correctOption,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        toast.error(errorData?.error || "AI enhance failed");
        setEnhancingIndex(null);
        return;
      }
      const data = await res.json();
      if (!data.question?.questionText) {
        setRawModal({ open: true, text: JSON.stringify(data) });
        setEnhancingIndex(null);
        return;
      }
      setEnhanceDraft({ ...data.question, position: q.position, id: q.id });
    } catch (err) {
      console.error("Error enhancing question:", err);
      toast.error("Failed to enhance question");
      setEnhancingIndex(null);
    }
  };

  // --- Generate 4 more questions ---
  const handleGenerateMore = async () => {
    setGenerating(true);
    setGeneratedDrafts([]);
    try {
      const res = await fetch("/api/ai/enhance-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          // Map to only send the necessary fields to the AI
          existingQuestions: questions.map((q) => ({
            questionText: q.questionText,
            options: q.options,
            correctOption: q.correctOption,
          })),
        }),
      });

      if (!res.ok) throw new Error("AI generate failed");

      const data = await res.json();

      setGeneratedDrafts(
        (data.questions as QuizQuestionWithAnswer[]).map((q, i) => ({
          ...q,
          position: questions.length + i,
        })),
      );

      toast.success("4 questions generated! Scroll down to review and save.");
    } catch {
      toast.error("Failed to generate more questions");
    } finally {
      setGenerating(false);
    }
  };

  // --- Delete single ---
  function handleDelete(questionId: string) {
    startTransition(async () => {
      const res = await deleteQuizQuestion(questionId);
      if (res.error) {
        toast.error(res.error);
      } else {
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
        toast.success("Question deleted.");
      }
    });
  }

  // --- Delete all ---
  const handleDeleteAll = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete ALL questions? This cannot be undone.",
      )
    ) {
      return;
    }
    setIsDeletingAll(true);
    try {
      await Promise.all(questions.map((q) => deleteQuizQuestion(q.id)));
      setQuestions([]);
      toast.success("All questions deleted.");
    } catch (error) {
      console.error("Error deleting all questions:", error);
      toast.error("Something went wrong while deleting.");
    } finally {
      setIsDeletingAll(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <h3 className="font-semibold text-primary-text">
          Quiz Questions ({questions.length})
        </h3>
        <div className="flex items-center gap-3">
          {questions.length > 0 && (
            <button
              onClick={handleDeleteAll}
              disabled={isDeletingAll || isPending}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeletingAll ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              {isDeletingAll ? "Deleting..." : "Clear All"}
            </button>
          )}
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 text-sm text-brand font-medium hover:bg-brand/10 px-3 py-1.5 rounded-md transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Add Question
          </button>
        </div>
      </div>

      {questions.map((q, qi) => (
        <div key={q.id} className="relative">
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <AiGenerateButton
              onGenerate={() => handleEnhance(qi)}
              label="Enhance"
              disabled={enhancingIndex === qi}
            />
            <button
              onClick={() => handleDelete(q.id)}
              disabled={isPending || isDeletingAll}
              className="text-secondary-text hover:text-red-500 transition-colors"
              aria-label="Delete question"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-5 pr-12 space-y-2">
            <p className="text-sm font-medium text-secondary-text">Q{qi + 1}</p>
            {enhancingIndex === qi && enhanceDraft ? (
              <QuestionForm
                lessonId={lessonId}
                question={enhanceDraft}
                position={q.position}
                onSaved={(saved) => {
                  setQuestions((prev) => {
                    const updated = [...prev];
                    updated[qi] = { ...saved, id: q.id };
                    return updated;
                  });
                  setEnhancingIndex(null);
                  setEnhanceDraft(null);
                }}
                onCancel={() => {
                  setEnhancingIndex(null);
                  setEnhanceDraft(null);
                }}
              />
            ) : (
              <>
                <p className="text-primary-text font-semibold">
                  {q.questionText}
                </p>
                <div className="grid gap-1 mt-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2 text-sm">
                      {oi === q.correctOption ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-border shrink-0" />
                      )}
                      <span
                        className={
                          oi === q.correctOption
                            ? "text-green-600 font-medium"
                            : "text-primary-text"
                        }
                      >
                        {opt}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      ))}

      {/* Move Generate 4 More button to bottom */}
      <div className="flex justify-end pt-4">
        <AiGenerateButton
          onGenerate={handleGenerateMore}
          label="Generate 4 More"
          disabled={questions.length < 4 || generating}
        />
      </div>

      {adding && (
        <QuestionForm
          lessonId={lessonId}
          position={questions.length}
          onSaved={(saved) => {
            setQuestions((prev) => [...prev, saved]);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      {generatedDrafts.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-brand">
            AI Generated Questions (Review & Save)
          </h4>
          {generatedDrafts.map((q) => (
            <QuestionForm
              key={q.questionText}
              lessonId={lessonId}
              question={q}
              position={q.position}
              onSaved={(saved) => {
                setQuestions((prev) => [...prev, saved]);
                setGeneratedDrafts((drafts) =>
                  drafts.filter(
                    (draft) => draft.questionText !== q.questionText,
                  ),
                );
              }}
              onCancel={() =>
                setGeneratedDrafts((drafts) =>
                  drafts.filter(
                    (draft) => draft.questionText !== q.questionText,
                  ),
                )
              }
            />
          ))}
        </div>
      )}

      {questions.length === 0 && !adding && (
        <div className="text-center py-8 text-secondary-text text-sm border border-dashed border-border rounded-2xl">
          No questions yet. Add one to get started.
        </div>
      )}

      {rawModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full relative">
            <h3 className="text-lg font-bold mb-2">AI Raw Output</h3>
            <textarea
              className="w-full h-40 border border-border rounded p-2 text-sm mb-4"
              value={rawModal.text}
              readOnly
              onFocus={(e) => e.target.select()}
            />
            <p className="text-xs text-secondary-text mb-2">
              Copy and manually edit the question below if needed.
            </p>
            <button
              className="px-4 py-2 bg-brand text-white rounded font-semibold"
              onClick={() => setRawModal(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
