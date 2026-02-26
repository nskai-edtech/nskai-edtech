"use client";

import { QaForm } from "./qa-form";
import { QuestionItem } from "./question-item";
import { useRouter } from "next/navigation";
import { QuestionWithRelations } from "@/types";
import { useModalStore } from "@/hooks/use-modal-store";
import { Sparkles } from "lucide-react";

interface QaSectionProps {
  lessonId: string;
  questions: QuestionWithRelations[];
}

export function QaSection({ lessonId, questions }: QaSectionProps) {
  const router = useRouter();
  const onOpen = useModalStore((state) => state.onOpen);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* --- The AI Mentor Banner --- */}
      <div className="mb-8 p-6 rounded-xl border border-brand/20 bg-brand/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand" />
            Stuck on this lesson?
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Get instant, real-time help from our AI Mentor tailored specifically
            to this video.
          </p>
        </div>
        <button
          onClick={() => onOpen("aiMentor", { lessonId })}
          className="shrink-0 h-10 px-4 py-2 flex items-center justify-center gap-2 rounded-md bg-brand text-primary-foreground hover:bg-brand/90 transition-colors font-medium text-sm"
        >
          <Sparkles className="h-4 w-4" />
          Ask AI Tutor
        </button>
      </div>
      {/* --------------------------------- */}

      <div className="mb-8">
        <h3 className="font-bold text-lg mb-4">Ask the Community</h3>
        <QaForm
          lessonId={lessonId}
          onSuccess={() => {
            router.refresh();
          }}
        />
      </div>

      <div className="space-y-6">
        <h3 className="font-bold text-lg mb-4">
          {questions.length} {questions.length === 1 ? "Question" : "Questions"}
        </h3>

        {questions.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border rounded-xl bg-surface-muted/30">
            <p className="text-secondary-text">
              No questions yet. Be the first to ask!
            </p>
          </div>
        ) : (
          questions.map((question) => (
            <QuestionItem key={question.id} question={question} />
          ))
        )}
      </div>
    </div>
  );
}
