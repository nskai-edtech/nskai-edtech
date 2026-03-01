"use client";

import { useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Trophy,
  Target,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { submitDiagnostic } from "@/actions/skills/diagnostic";
import type {
  AssessmentQuestionLearner,
  DiagnosticSubmission,
} from "@/actions/skills/types";

interface AssessmentPlayerProps {
  questions: AssessmentQuestionLearner[];
  skillMap: Record<string, string>;
  onComplete: (results: DiagnosticSubmission) => void;
  onSkip?: () => void;
}

export function AssessmentPlayer({
  questions,
  skillMap,
  onComplete,
  onSkip,
}: AssessmentPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selected).length;
  const allAnswered = answeredCount === totalQuestions;
  const progress = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const goNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, totalQuestions]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  const selectAnswer = useCallback(
    (optionIndex: number) => {
      setSelected((prev) => ({
        ...prev,
        [currentQuestion.id]: optionIndex,
      }));
    },
    [currentQuestion.id],
  );

  async function handleSubmit() {
    if (!allAnswered) {
      toast.error("Please answer all questions before submitting.");
      return;
    }
    setIsSubmitting(true);

    const res = await submitDiagnostic(selected);
    setIsSubmitting(false);

    if ("error" in res) {
      toast.error(res.error);
      return;
    }

    if (res.xpAwarded > 0) {
      toast.success(`+${res.xpAwarded} XP awarded!`);
    }

    onComplete(res);
  }

  const difficultyColors: Record<string, string> = {
    BEGINNER:
      "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400",
    INTERMEDIATE:
      "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
    ADVANCED: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-brand" />
            <span className="text-sm font-medium text-brand">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
          </div>
          <span className="text-sm text-secondary-text">
            {answeredCount} answered
          </span>
        </div>
        <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-brand rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Skill Tag */}
      <div className="mb-4">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-surface-muted text-secondary-text">
          {skillMap[currentQuestion.skillId] || "Unknown Skill"}
        </span>
        {currentQuestion.difficulty && (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ml-2",
              difficultyColors[currentQuestion.difficulty] ||
                "bg-surface-muted text-secondary-text",
            )}
          >
            {currentQuestion.difficulty}
          </span>
        )}
      </div>

      {/* Question Card */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 mb-6">
        <p className="text-lg font-semibold text-primary-text mb-6">
          {currentQuestion.questionText}
        </p>

        <div className="space-y-3">
          {currentQuestion.options.map((opt, oi) => {
            const isSelected = selected[currentQuestion.id] === oi;

            return (
              <button
                key={oi}
                onClick={() => selectAnswer(oi)}
                className={cn(
                  "w-full text-left px-5 py-4 rounded-xl border text-sm transition-all",
                  isSelected
                    ? "border-brand bg-brand/10 text-brand font-medium shadow-sm"
                    : "border-border hover:border-brand/50 text-primary-text cursor-pointer bg-surface",
                )}
              >
                <span className="font-mono mr-3 text-secondary-text">
                  {String.fromCharCode(65 + oi)}.
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Dot Navigation */}
      <div className="flex flex-wrap gap-1.5 justify-center mb-6">
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(i)}
            className={cn(
              "w-3 h-3 rounded-full transition-all",
              i === currentIndex
                ? "bg-brand scale-125"
                : selected[q.id] !== undefined
                  ? "bg-brand/40"
                  : "bg-surface-muted",
            )}
            title={`Question ${i + 1}`}
          />
        ))}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-secondary-text hover:text-primary-text disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          {onSkip && (
            <button
              onClick={onSkip}
              className="px-4 py-2 text-sm font-medium text-secondary-text hover:text-primary-text transition-colors"
            >
              Skip for now
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {currentIndex < totalQuestions - 1 ? (
            <button
              onClick={goNext}
              className="flex items-center gap-1 px-6 py-2.5 rounded-lg bg-brand text-white font-medium hover:bg-brand/90 transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand text-white font-medium hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Grading...
                </>
              ) : (
                <>
                  <Trophy className="w-4 h-4" />
                  Submit Assessment
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Results Display ───
export function AssessmentResults({
  results,
  onRetakeAction,
  onContinueAction,
}: {
  results: DiagnosticSubmission;
  onRetakeAction?: () => void;
  onContinueAction?: () => void;
}) {
  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      {/* Overall Score */}
      <div className="flex flex-col items-center justify-center gap-4 py-8 bg-surface border border-border rounded-2xl mb-6">
        <Trophy
          className={cn(
            "w-14 h-14",
            results.overallScore >= 70
              ? "text-yellow-500"
              : results.overallScore >= 40
                ? "text-amber-500"
                : "text-red-500",
          )}
        />
        <div>
          <p className="text-4xl font-bold text-primary-text">
            {results.overallScore}%
          </p>
          <p className="text-secondary-text mt-1">
            {results.totalCorrect} of {results.totalQuestions} correct
          </p>
        </div>
        {results.xpAwarded > 0 && (
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand/10 text-brand text-sm font-medium">
            +{results.xpAwarded} XP
          </div>
        )}
      </div>

      {/* Per-Skill Breakdown */}
      <div className="space-y-3 mb-8">
        <h3 className="text-lg font-semibold text-primary-text text-left">
          Skill Breakdown
        </h3>
        {results.results.map((r) => (
          <div
            key={r.skillId}
            className="flex items-center gap-4 p-4 bg-surface border border-border rounded-xl"
          >
            <div className="flex-1 text-left">
              <p className="font-medium text-primary-text text-sm">
                {r.skillTitle}
              </p>
              <p className="text-xs text-secondary-text">{r.skillCategory}</p>
            </div>
            <div className="flex items-center gap-3">
              {r.previousScore !== null && (
                <span className="text-xs text-secondary-text">
                  was {r.previousScore}%
                </span>
              )}
              <div className="w-32 h-2 bg-surface-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    r.masteryScore >= 80
                      ? "bg-green-500"
                      : r.masteryScore >= 50
                        ? "bg-amber-500"
                        : "bg-red-500",
                  )}
                  style={{ width: `${r.masteryScore}%` }}
                />
              </div>
              <span
                className={cn(
                  "text-sm font-semibold min-w-12 text-right",
                  r.masteryScore >= 80
                    ? "text-green-600 dark:text-green-400"
                    : r.masteryScore >= 50
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-red-600 dark:text-red-400",
                )}
              >
                {r.masteryScore}%
              </span>
              {r.masteryScore >= 80 ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3">
        {onRetakeAction && (
          <button
            onClick={onRetakeAction}
            className="px-6 py-2.5 rounded-lg border border-border text-primary-text font-medium hover:bg-surface-muted transition-colors"
          >
            Retake Assessment
          </button>
        )}
        {onContinueAction && (
          <button
            onClick={onContinueAction}
            className="px-6 py-2.5 rounded-lg bg-brand text-white font-medium hover:bg-brand/90 transition-colors"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
