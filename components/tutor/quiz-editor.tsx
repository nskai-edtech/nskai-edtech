"use client";

import { useState, useTransition } from "react";
import {
  saveQuizQuestion,
  deleteQuizQuestion,
  type QuizQuestionWithAnswer,
} from "@/actions/quiz";
import { PlusCircle, Trash2, Save, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

interface QuizEditorProps {
  lessonId: string;
  initialQuestions: QuizQuestionWithAnswer[];
}

function QuestionForm({
  lessonId,
  question,
  position,
  onSaved,
}: {
  lessonId: string;
  question?: QuizQuestionWithAnswer;
  position: number;
  onSaved: () => void;
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
      } else {
        toast.success("Question saved!");
        onSaved();
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
      <button
        onClick={handleSave}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand/90 disabled:opacity-50 transition-colors"
      >
        <Save className="w-3.5 h-3.5" />
        {isPending ? "Saving..." : "Save Question"}
      </button>
    </div>
  );
}

export function QuizEditor({ lessonId, initialQuestions }: QuizEditorProps) {
  const [questions, setQuestions] =
    useState<QuizQuestionWithAnswer[]>(initialQuestions);
  const [adding, setAdding] = useState(false);
  const [isPending, startTransition] = useTransition();

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-primary-text">
          Quiz Questions ({questions.length})
        </h3>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 text-sm text-brand font-medium hover:underline"
        >
          <PlusCircle className="w-4 h-4" />
          Add Question
        </button>
      </div>

      {questions.map((q, qi) => (
        <div key={q.id} className="relative">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => handleDelete(q.id)}
              disabled={isPending}
              className="text-secondary-text hover:text-red-500 transition-colors"
              aria-label="Delete question"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-5 pr-12 space-y-2">
            <p className="text-sm font-medium text-secondary-text">Q{qi + 1}</p>
            <p className="text-primary-text font-semibold">{q.questionText}</p>
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
          </div>
        </div>
      ))}

      {adding && (
        <QuestionForm
          lessonId={lessonId}
          position={questions.length}
          onSaved={() => {
            setAdding(false);
            // Could refresh server data here; for now we rely on revalidatePath
            toast.success("Refresh to see latest questions.");
          }}
        />
      )}

      {questions.length === 0 && !adding && (
        <div className="text-center py-8 text-secondary-text text-sm border border-dashed border-border rounded-2xl">
          No questions yet. Add one to get started.
        </div>
      )}
    </div>
  );
}
