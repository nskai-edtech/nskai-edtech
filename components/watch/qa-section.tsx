"use strict";
"use client";

import { QaForm } from "./qa-form";
import { QuestionItem } from "./question-item";
import { useRouter } from "next/navigation";

import { QuestionWithRelations } from "@/types";

interface QaSectionProps {
  lessonId: string;
  questions: QuestionWithRelations[];
}

export function QaSection({ lessonId, questions }: QaSectionProps) {
  const router = useRouter();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-8">
        <h3 className="font-bold text-lg mb-4">Ask a question</h3>
        <QaForm
          lessonId={lessonId}
          onSuccess={() => {
            router.refresh(); // Refresh server components to get new data
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
