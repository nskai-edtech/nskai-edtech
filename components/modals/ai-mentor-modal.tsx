"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useModalStore } from "@/hooks/use-modal-store";
import {
  X,
  Send,
  Bot,
  Loader2,
  Trash2,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getOrCreateConversation,
  getChatHistory,
  clearChatHistory,
} from "@/actions/chat";

interface Message {
  role: "user" | "ai";
  content: string;
}

const GREETING: Message = {
  role: "ai",
  content:
    "Hello! I'm your AI Mentor. What question do you have about this lesson?",
};

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      <span className="text-xs font-medium text-secondary-text">Typing</span>
      <span className="flex items-center gap-0.75">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.25 w-1.25 rounded-full bg-brand/70"
            style={{
              animation: "ai-bounce 1.4s ease-in-out infinite",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </span>
      <style>{`
        @keyframes ai-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export function AiMentorModal() {
  const { isOpen, onClose, type, data } = useModalStore();
  const isModalOpen = isOpen && type === "aiMentor";
  const { lessonId } = data;

  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<
    Record<number, "up" | "down">
  >({});
  const [contextQuality, setContextQuality] = useState<"full" | "partial" | "none" | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load conversation + history when the modal opens with a lessonId
  const loadHistory = useCallback(async (lid: string) => {
    setIsLoadingHistory(true);
    try {
      const convResult = await getOrCreateConversation(lid);
      if (convResult.error || !convResult.conversationId) {
        setConversationId(null);
        setMessages([GREETING]);
        return;
      }

      setConversationId(convResult.conversationId);

      const historyResult = await getChatHistory(convResult.conversationId);
      if (
        !historyResult.error &&
        historyResult.messages &&
        historyResult.messages.length > 0
      ) {
        setMessages(
          historyResult.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        );
      } else {
        setMessages([GREETING]);
      }
    } catch {
      setConversationId(null);
      setMessages([GREETING]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (isModalOpen && lessonId) {
      loadHistory(lessonId);
    }
    if (!isModalOpen) {
      setConversationId(null);
      setMessages([GREETING]);
      setInput("");
      setFeedbackGiven({});
      setContextQuality(null);
    }
  }, [isModalOpen, lessonId, loadHistory]);

  const handleClearHistory = async () => {
    if (!conversationId) return;
    try {
      await clearChatHistory(conversationId);
      setMessages([GREETING]);
      setFeedbackGiven({});
    } catch {
      console.error("Failed to clear chat history");
    }
  };

  // Submit feedback for a specific AI message
  const handleFeedback = async (
    messageIndex: number,
    rating: "up" | "down",
  ) => {
    if (feedbackGiven[messageIndex]) return;
    setFeedbackGiven((prev) => ({ ...prev, [messageIndex]: rating }));

    const aiMsg = messages[messageIndex];
    // Find the preceding user message
    const userMsg = messages
      .slice(0, messageIndex)
      .reverse()
      .find((m) => m.role === "user");

    try {
      await fetch("/api/ai/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMsg?.content ?? "",
          response: aiMsg.content,
          rating: rating === "up" ? 5 : 1,
          conversationTrace: messages.slice(0, messageIndex + 1).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });
    } catch {
      // Silent — feedback is best-effort
    }
  };

  if (!isModalOpen) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    const updatedMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(updatedMessages);
    setIsLoading(true);

    setMessages((prev) => [...prev, { role: "ai", content: "" }]);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          message: userMessage,
          conversationId,
          // Send full message history for the AI Core
          messages: updatedMessages
            .filter((m) => m.content) // exclude empty greeting-like messages if needed
            .map((m) => ({
              role: m.role,
              content: m.content,
            })),
        }),
      });

      if (!response.body) throw new Error("No response body");

      // Read context quality header from the API response
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
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "Sorry, my brain disconnected. Please try again!",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 dark:bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-lg rounded-xl shadow-2xl border border-border flex flex-col overflow-hidden m-4 h-150 max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-surface-muted">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand rounded-md">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-primary-text">AI Mentor</h2>
              <p className="text-xs text-secondary-text">
                Real-time lesson assistant
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {conversationId && messages.length > 1 && (
              <button
                onClick={handleClearHistory}
                title="Clear chat history"
                className="p-2 hover:bg-surface-muted rounded-full transition-colors text-secondary-text hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-muted rounded-full transition-colors text-secondary-text"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Context quality info banner */}
        {contextQuality && contextQuality === "none" && (
          <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Unable to load lesson context. The AI will use its general knowledge to help you.
            </p>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-surface">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-brand" />
              <span className="ml-2 text-sm text-secondary-text">
                Loading chat history…
              </span>
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
                  <div className="h-8 w-8 rounded-full bg-brand/10 dark:bg-brand/20 text-brand flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div className="flex flex-col gap-1 max-w-[80%]">
                  <div
                    className={cn(
                      "rounded-lg px-4 py-2 text-sm",
                      msg.role === "user"
                        ? "bg-brand text-white"
                        : "bg-surface-muted text-primary-text font-medium border border-border",
                    )}
                  >
                    {msg.role === "ai" &&
                    !msg.content &&
                    isLoading &&
                    index === messages.length - 1 ? (
                      <TypingIndicator />
                    ) : (
                      msg.content
                    )}
                  </div>
                  {/* Feedback thumbs for AI messages (not the greeting, not while loading) */}
                  {msg.role === "ai" &&
                    index > 0 &&
                    msg.content &&
                    !isLoading && (
                      <div className="flex items-center gap-1 ml-1">
                        <button
                          onClick={() => handleFeedback(index, "up")}
                          disabled={!!feedbackGiven[index]}
                          className={cn(
                            "p-1 rounded transition-colors",
                            feedbackGiven[index] === "up"
                              ? "text-green-500"
                              : "text-secondary-text hover:text-green-500",
                            feedbackGiven[index] &&
                              feedbackGiven[index] !== "up" &&
                              "opacity-30",
                          )}
                          title="Helpful"
                        >
                          <ThumbsUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleFeedback(index, "down")}
                          disabled={!!feedbackGiven[index]}
                          className={cn(
                            "p-1 rounded transition-colors",
                            feedbackGiven[index] === "down"
                              ? "text-red-500"
                              : "text-secondary-text hover:text-red-500",
                            feedbackGiven[index] &&
                              feedbackGiven[index] !== "down" &&
                              "opacity-30",
                          )}
                          title="Not helpful"
                        >
                          <ThumbsDown className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 border-t border-border bg-surface">
          <form onSubmit={onSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about this video..."
              disabled={isLoading || isLoadingHistory}
              className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary-text shadow-sm placeholder:text-secondary-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim() || isLoadingHistory}
              className="h-9 w-9 flex items-center justify-center rounded-md bg-brand text-white hover:bg-brand/90 disabled:opacity-50 transition-colors shrink-0"
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
    </div>
  );
}
