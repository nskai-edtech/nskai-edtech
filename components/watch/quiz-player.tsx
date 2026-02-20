"use client";

import { useState } from "react";
import { submitQuiz, type QuizQuestion } from "@/actions/quiz";
import { CheckCircle2, XCircle, RotateCcw, Trophy } from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

interface QuizPlayerProps {
  lessonId: string;
  questions: QuizQuestion[];
  lastAttempt?: { score: number; passed: boolean; completedAt: Date } | null;
}

export function QuizPlayer({
  lessonId,
  questions,
  lastAttempt,
}: QuizPlayerProps) {
  // selected answers: questionId -> selectedOptionIndex
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allAnswered = questions.every((q) => q.id in selected);
  const isRetake = !!lastAttempt && !result;

  async function handleSubmit() {
    if (!allAnswered) {
      toast.error("Please answer all questions before submitting.");
      return;
    }
    setIsSubmitting(true);
    const res = await submitQuiz(lessonId, selected);
    setIsSubmitting(false);

    if ("error" in res) {
      toast.error(res.error);
      return;
    }
    setResult(res);
  }

  function handleRetake() {
    setSelected({});
    setResult(null);
  }

  // — Result Screen —
  if (result) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
        {result.passed ? (
          <Trophy className="w-16 h-16 text-yellow-500" />
        ) : (
          <XCircle className="w-16 h-16 text-red-500" />
        )}
        <div>
          <p className="text-3xl font-bold text-primary-text">
            {result.score}%
          </p>
          <p
            className={cn(
              "text-lg font-semibold mt-1",
              result.passed ? "text-green-500" : "text-red-500",
            )}
          >
            {result.passed ? "Passed! 🎉" : "Not quite – try again!"}
          </p>
          <p className="text-secondary-text text-sm mt-2">
            You need at least 70% to pass.
          </p>
        </div>
        {!result.passed && (
          <button
            onClick={handleRetake}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-brand text-white font-semibold hover:bg-brand/90 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Retake Quiz
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Previous attempt banner */}
      {isRetake && lastAttempt && (
        <div className="flex items-center gap-3 p-4 bg-surface-muted rounded-xl border border-border text-secondary-text text-sm">
          {lastAttempt.passed ? (
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500 shrink-0" />
          )}
          <span>
            Last attempt: <strong>{lastAttempt.score}%</strong> –{" "}
            {lastAttempt.passed ? "Passed" : "Failed"}
          </span>
        </div>
      )}

      {/* Questions */}
      {questions.map((q, qi) => (
        <div
          key={q.id}
          className="bg-surface border border-border rounded-2xl p-6 space-y-4"
        >
          <p className="font-semibold text-primary-text">
            <span className="text-secondary-text text-sm mr-2">Q{qi + 1}.</span>
            {q.questionText}
          </p>
          <div className="grid gap-2">
            {q.options.map((opt, oi) => (
              <button
                key={oi}
                onClick={() => setSelected((prev) => ({ ...prev, [q.id]: oi }))}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors",
                  selected[q.id] === oi
                    ? "border-brand bg-brand/10 text-brand font-medium"
                    : "border-border hover:border-brand/50 text-primary-text",
                )}
              >
                <span className="font-mono mr-2 text-secondary-text">
                  {String.fromCharCode(65 + oi)}.
                </span>
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!allAnswered || isSubmitting}
        className="w-full py-3 rounded-xl bg-brand text-white font-semibold hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? "Submitting..." : "Submit Quiz"}
      </button>
    </div>
  );
}
