"use strict";
"use client";

import { useState } from "react";
import { User, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { QaForm } from "./qa-form";

import { QuestionWithRelations } from "@/types";

interface QuestionItemProps {
  question: QuestionWithRelations;
}

export function QuestionItem({ question }: QuestionItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);

  const answerCount = question.answers?.length || 0;

  return (
    <div className="bg-surface border border-border rounded-xl p-4 mb-4">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="shrink-0">
          {question.user.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={question.user.imageUrl}
              alt={question.user.firstName || "User"}
              className="w-10 h-10 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center border border-border">
              <User className="w-5 h-5 text-secondary-text" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-bold text-sm text-primary-text">
              {question.user.firstName} {question.user.lastName}
            </h4>
            <span className="text-xs text-secondary-text">
              {new Date(question.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-secondary-text mb-3">{question.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center gap-1.5 text-xs font-bold text-secondary-text hover:text-brand transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Reply
            </button>
            {answerCount > 0 && (
              <button
                onClick={() => setShowAnswers(!showAnswers)}
                className="flex items-center gap-1.5 text-xs font-bold text-brand hover:text-brand-dark transition-colors"
              >
                {showAnswers ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
                {answerCount} {answerCount === 1 ? "Reply" : "Replies"}
              </button>
            )}
          </div>

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2">
              <QaForm
                questionId={question.id}
                placeholder="Write a reply..."
                className="w-full"
                onSuccess={() => setIsReplying(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Answers List */}
      {showAnswers && answerCount > 0 && (
        <div className="ml-12 mt-4 space-y-4 pl-4 border-l-2 border-border animate-in fade-in slide-in-from-top-2">
          {question.answers.map((answer) => (
            <div key={answer.id} className="flex gap-3">
              <div className="shrink-0">
                {answer.user.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={answer.user.imageUrl}
                    alt={answer.user.firstName || "User"}
                    className="w-8 h-8 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center border border-border">
                    <User className="w-4 h-4 text-secondary-text" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="font-bold text-xs text-primary-text">
                    {answer.user.firstName} {answer.user.lastName}
                  </h5>
                  <span className="text-[10px] text-secondary-text">
                    {new Date(answer.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-secondary-text">{answer.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
