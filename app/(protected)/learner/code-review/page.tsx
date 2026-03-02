"use client";

import { useState, useRef, useEffect } from "react";
import {
  Code2,
  Send,
  Loader2,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  RotateCcw,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ReviewResult {
  feedback: string;
  errorCategory?: string | null;
  lineNumber?: number | null;
  confidence: number;
  hintCount: number;
  hasMoreIssues: boolean;
  conversationId?: string | null;
}

interface ConversationEntry {
  type: "user-code" | "user-followup" | "ai-review" | "error";
  content: string;
  result?: ReviewResult;
}

const LANGUAGES = [
  "python",
  "javascript",
  "typescript",
  "java",
  "c",
  "cpp",
  "go",
  "rust",
  "html",
  "css",
  "sql",
  "bash",
  "swift",
  "kotlin",
];

export default function CodeReviewPage() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [studentLevel, setStudentLevel] = useState("intermediate");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [followUp, setFollowUp] = useState("");
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  const submitReview = async (isFollowUp = false) => {
    if (!code.trim() && !isFollowUp) return;
    if (isFollowUp && !followUp.trim()) return;
    setIsLoading(true);

    // Add user message to conversation
    if (isFollowUp) {
      setConversation((prev) => [
        ...prev,
        { type: "user-followup", content: followUp.trim() },
      ]);
    } else {
      setConversation((prev) => [
        ...prev,
        {
          type: "user-code",
          content: code.length > 200 ? code.slice(0, 200) + "..." : code,
        },
      ]);
    }

    try {
      const response = await fetch("/api/ai/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          studentLevel,
          conversationId: isFollowUp ? conversationId : null,
          userFollowup: isFollowUp ? followUp.trim() : null,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || `Error ${response.status}`);
      }

      const data: ReviewResult = await response.json();
      setConversationId(data.conversationId ?? null);
      setFollowUp("");

      // Add AI response to conversation
      setConversation((prev) => [
        ...prev,
        { type: "ai-review", content: data.feedback, result: data },
      ]);
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : "Something went wrong";
      setConversation((prev) => [...prev, { type: "error", content: errMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReview(false);
  };

  const handleFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (followUp.trim()) submitReview(true);
  };

  const handleReset = () => {
    setConversation([]);
    setConversationId(null);
    setFollowUp("");
  };

  const hasResults = conversation.length > 0;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/learner"
            className="p-2 hover:bg-surface-muted rounded-lg transition-colors text-secondary-text"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="p-2 bg-brand rounded-lg">
            <Code2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-primary-text">
              AI Code Reviewer
            </h1>
            <p className="text-xs text-secondary-text">
              Get Socratic feedback on your code — learn by discovering
            </p>
          </div>
        </div>
        {hasResults && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-secondary-text hover:text-primary-text hover:bg-surface-muted transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Start Over
          </button>
        )}
      </div>

      {/* Code Input */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <div>
            <label className="text-xs font-medium text-secondary-text mb-1 block">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary-text"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-secondary-text mb-1 block">
              Level
            </label>
            <select
              value={studentLevel}
              onChange={(e) => setStudentLevel(e.target.value)}
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary-text"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-secondary-text mb-1 block">
            Your Code
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`# Paste your ${language} code here...\ndef example():\n    pass`}
            rows={12}
            className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-primary-text font-mono shadow-sm placeholder:text-secondary-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand resize-y"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !code.trim()}
          className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-50 transition-colors"
        >
          {isLoading && !hasResults ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Review My Code
        </button>
      </form>

      {/* Conversation Thread */}
      {hasResults && (
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-secondary-text">
            Conversation
          </h2>

          <div className="space-y-3">
            {conversation.map((entry, index) => {
              // User code submission
              if (entry.type === "user-code") {
                return (
                  <div key={index} className="flex justify-end">
                    <div className="flex items-start gap-2 max-w-[85%]">
                      <div className="rounded-lg bg-brand px-4 py-2.5 text-sm text-white">
                        <p className="text-xs opacity-80 mb-1">
                          Submitted code for review
                        </p>
                        <code className="text-xs font-mono opacity-90 line-clamp-3">
                          {entry.content}
                        </code>
                      </div>
                      <div className="h-7 w-7 rounded-full bg-brand/20 text-brand flex items-center justify-center shrink-0 mt-0.5">
                        <User className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                );
              }

              // User follow-up question
              if (entry.type === "user-followup") {
                return (
                  <div key={index} className="flex justify-end">
                    <div className="flex items-start gap-2 max-w-[85%]">
                      <div className="rounded-lg bg-brand px-4 py-2.5 text-sm text-white">
                        {entry.content}
                      </div>
                      <div className="h-7 w-7 rounded-full bg-brand/20 text-brand flex items-center justify-center shrink-0 mt-0.5">
                        <User className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                );
              }

              // Error
              if (entry.type === "error") {
                return (
                  <div
                    key={index}
                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400"
                  >
                    {entry.content}
                  </div>
                );
              }

              // AI review response
              const result = entry.result!;
              return (
                <div key={index} className="flex justify-start">
                  <div className="flex items-start gap-2 max-w-[85%]">
                    <div className="h-7 w-7 rounded-full bg-brand/10 dark:bg-brand/20 text-brand flex items-center justify-center shrink-0 mt-0.5">
                      <MessageSquare className="h-3.5 w-3.5" />
                    </div>
                    <div className="rounded-lg border border-border bg-surface-muted p-4 space-y-2.5">
                      {/* Metadata badges */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-secondary-text">
                        {result.errorCategory && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <AlertTriangle className="h-3 w-3" />
                            {result.errorCategory.replace("_", " ")}
                          </span>
                        )}
                        {result.lineNumber && (
                          <span className="px-2 py-0.5 rounded-full bg-surface border border-border">
                            Line {result.lineNumber}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full bg-surface border border-border">
                          Hint {result.hintCount}/3
                        </span>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full border",
                            result.confidence >= 0.8
                              ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                              : "bg-surface border-border",
                          )}
                        >
                          {Math.round(result.confidence * 100)}% confident
                        </span>
                      </div>

                      {/* Feedback text */}
                      <p className="text-sm text-primary-text leading-relaxed whitespace-pre-wrap">
                        {result.feedback}
                      </p>

                      {/* Indicators */}
                      {result.hasMoreIssues && (
                        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="h-3 w-3" />
                          There are more issues to discuss — ask a follow-up!
                        </div>
                      )}
                      {!result.hasMoreIssues &&
                        result.errorCategory === null &&
                        result.confidence >= 0.7 && (
                          <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                            <CheckCircle2 className="h-3 w-3" />
                            Your code looks good!
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2">
                  <div className="h-7 w-7 rounded-full bg-brand/10 dark:bg-brand/20 text-brand flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquare className="h-3.5 w-3.5" />
                  </div>
                  <div className="rounded-lg border border-border bg-surface-muted px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-brand" />
                  </div>
                </div>
              </div>
            )}

            <div ref={conversationEndRef} />
          </div>

          {/* Follow-up input */}
          <form onSubmit={handleFollowUp} className="flex gap-2">
            <input
              type="text"
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              placeholder="Ask a follow-up question..."
              disabled={isLoading}
              className="flex-1 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-primary-text shadow-sm placeholder:text-secondary-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !followUp.trim()}
              className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
