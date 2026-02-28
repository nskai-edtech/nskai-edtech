"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, Trophy } from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { QuizQuestion } from "@/actions/quiz/types";
import { submitQuiz } from "@/actions/quiz/actions";
import { useModalStore } from "@/hooks/use-modal-store";

interface QuizPlayerProps {
  lessonId: string;
  questions: (QuizQuestion & { correctOption?: number })[];
  lastAttempt?: {
    score: number;
    passed: boolean;
    completedAt: Date;
    answers?: Record<string, number> | null;
  } | null;
}

export function QuizPlayer({
  lessonId,
  questions,
  lastAttempt,
}: QuizPlayerProps) {
  // Initialize with last answers if available so they are highlighted on retake
  const [selected, setSelected] = useState<Record<string, number>>(
    lastAttempt?.answers || {},
  );

  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
  } | null>(
    lastAttempt
      ? { score: lastAttempt.score, passed: lastAttempt.passed }
      : null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allAnswered = questions.every((q) => q.id in selected);
  const isRetake = !!lastAttempt;
  const { onOpen } = useModalStore();

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

    // Show XP toast for quiz pass
    if (res.passed) {
      toast.success("+5 XP awarded for passing this quiz!");
    }

    if (res.passed && "courseCompleted" in res && res.courseCompleted) {
      toast.success("Course completed 100%!");
      setTimeout(() => {
        onOpen("courseCompleted", {
          courseId: (res as { courseId?: string }).courseId,
          courseTitle: (res as { courseTitle?: string }).courseTitle,
        });
      }, 1500);
    }
  }

  function handleRetake() {
    setResult(null);
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

      {/* Result Overview (if submitted) */}
      {result && (
        <div className="flex flex-col items-center justify-center gap-4 py-8 text-center bg-surface border border-border rounded-2xl">
          {result.passed ? (
            <Trophy className="w-12 h-12 text-yellow-500" />
          ) : (
            <XCircle className="w-12 h-12 text-red-500" />
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
          </div>
          {!result.passed && (
            <button
              onClick={handleRetake}
              className="mt-2 flex items-center gap-2 px-6 py-2 rounded-xl bg-brand text-white font-semibold hover:bg-brand/90 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Quiz
            </button>
          )}
        </div>
      )}

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((q, qi) => {
          const isPassed = result?.passed;
          const userPicked = selected[q.id];
          const isCorrect = userPicked === q.correctOption;

          return (
            <div
              key={q.id}
              className={cn(
                "bg-surface border rounded-2xl p-6 space-y-4 transition-colors",
                isPassed
                  ? isCorrect
                    ? "border-green-500/50 bg-green-500/5"
                    : "border-red-500/50 bg-red-500/5"
                  : "border-border",
              )}
            >
              <div className="flex items-start justify-between">
                <p className="font-semibold text-primary-text">
                  <span className="text-secondary-text text-sm mr-2">
                    Q{qi + 1}.
                  </span>
                  {q.questionText}
                </p>
                {isPassed && (
                  <div>
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                {q.options.map((opt, oi) => {
                  let btnClass = isPassed
                    ? "border-border text-primary-text opacity-70 cursor-default bg-surface" // disabled state
                    : selected[q.id] === oi
                      ? "border-brand bg-brand/10 text-brand font-medium"
                      : "border-border hover:border-brand/50 text-primary-text cursor-pointer bg-surface";

                  if (isPassed) {
                    if (q.correctOption === oi) {
                      btnClass =
                        "border-green-500 bg-green-500/10 text-green-600 font-medium cursor-default";
                    } else if (selected[q.id] === oi) {
                      btnClass =
                        "border-red-500 bg-red-500/10 text-red-600 font-medium cursor-default";
                    }
                  }

                  return (
                    <button
                      key={oi}
                      onClick={() =>
                        !result &&
                        setSelected((prev) => ({ ...prev, [q.id]: oi }))
                      }
                      disabled={!!result}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors",
                        btnClass,
                      )}
                    >
                      <span className="font-mono mr-2 text-secondary-text">
                        {String.fromCharCode(65 + oi)}.
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit */}
      {!result && (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || isSubmitting}
          className="w-full py-3 rounded-xl bg-brand text-white font-semibold hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Submitting..." : "Submit Quiz"}
        </button>
      )}
    </div>
  );
}
