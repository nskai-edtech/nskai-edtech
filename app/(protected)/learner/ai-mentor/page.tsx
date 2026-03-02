"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Send,
  Bot,
  Loader2,
  Trash2,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Message {
  role: "user" | "ai";
  content: string;
}

const SUGGESTIONS = [
  "Explain this concept simply",
  "Give me a practice problem",
  "What should I learn next?",
  "Help me understand the prerequisites",
];

export default function AiMentorPage() {
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("lessonId");

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contextQuality, setContextQuality] = useState<"full" | "partial" | "none" | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage = content.trim();
    setInput("");

    const updatedMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(updatedMessages);
    setIsLoading(true);

    // Add placeholder AI message for streaming
    setMessages((prev) => [...prev, { role: "ai", content: "" }]);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          ...(lessonId && { lessonId }),
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      if (!response.body) throw new Error("No response body");

      // Read context quality header
      const ctxQuality = response.headers.get("X-Lesson-Context") as "full" | "partial" | "none" | null;
      if (ctxQuality && !contextQuality) {
        setContextQuality(ctxQuality);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            content: newMessages[lastIndex].content + chunk,
          };
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        if (newMessages[lastIndex]?.role === "ai" && !newMessages[lastIndex].content) {
          newMessages[lastIndex] = {
            role: "ai",
            content: "Sorry, I couldn't process that request. Please try again.",
          };
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
  };

  const handleClear = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between py-4 px-2">
        <div className="flex items-center gap-3">
          <Link
            href="/learner"
            className="p-2 hover:bg-surface-muted rounded-lg transition-colors text-secondary-text"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="p-2 bg-brand rounded-lg">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-primary-text">
              AI Mentor
            </h1>
            <p className="text-xs text-secondary-text">
              {lessonId ? "Lesson assistant" : "Ask anything about your courses"}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            title="Clear conversation"
            className="p-2 hover:bg-surface-muted rounded-lg transition-colors text-secondary-text hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Context quality warning */}
      {contextQuality && contextQuality !== "full" && lessonId && (
        <div className="mx-2 mb-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            {contextQuality === "partial"
              ? "The video transcript isn\u2019t available yet. The AI has limited context about this lesson."
              : "Unable to load lesson context. The AI may not know details about this specific video."}
          </p>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          /* Empty state with suggestions */
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="p-4 bg-brand/10 dark:bg-brand/20 rounded-2xl">
              <Sparkles className="h-10 w-10 text-brand" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-primary-text">
                How can I help you learn?
              </h2>
              <p className="text-sm text-secondary-text max-w-md">
                I&apos;m your AI-powered learning companion. Ask me questions,
                request practice problems, or get help understanding concepts.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  className="text-left text-sm px-4 py-3 rounded-lg border border-border bg-surface hover:bg-surface-muted transition-colors text-secondary-text hover:text-primary-text"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-3",
                msg.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              {msg.role === "ai" && (
                <div className="h-8 w-8 rounded-full bg-brand/10 dark:bg-brand/20 text-brand flex items-center justify-center shrink-0 mt-1">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={cn(
                  "rounded-lg px-4 py-3 max-w-[80%] text-sm whitespace-pre-wrap",
                  msg.role === "user"
                    ? "bg-brand text-white"
                    : "bg-surface-muted text-primary-text border border-border",
                )}
              >
                {msg.content ||
                  (isLoading && index === messages.length - 1 ? (
                    <Loader2 className="h-4 w-4 animate-spin text-brand" />
                  ) : null)}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="py-4 px-2">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your AI Mentor anything..."
            disabled={isLoading}
            className="flex-1 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-primary-text shadow-sm placeholder:text-secondary-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="h-11 w-11 flex items-center justify-center rounded-lg bg-brand text-white hover:bg-brand/90 disabled:opacity-50 transition-colors shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
