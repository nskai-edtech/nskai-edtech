"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import {
  Sparkles,
  MessageSquare,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Loader2,
  AlertTriangle,
  Menu,
} from "lucide-react";
import toast from "react-hot-toast";

export interface BackendChatMessage {
  id: string;
  role: "user" | "ai" | "system";
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}

interface ConfirmDeleteModalProps {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export function ConfirmDeleteModal({
  title,
  onConfirm,
  onCancel,
  isDeleting,
}: ConfirmDeleteModalProps) {
  return (
    <div
      className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-base font-bold text-primary-text">
            Delete this chat?
          </h3>
          <p className="text-sm text-secondary-text leading-relaxed">
            <span className="font-medium text-primary-text">
              &ldquo;{title}&rdquo;
            </span>{" "}
            and all its messages will be permanently deleted. This cannot be
            undone.
          </p>
        </div>

        <div className="flex gap-3 mt-1">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 rounded-xl border border-border bg-surface-muted px-4 py-2.5 text-sm font-semibold text-primary-text transition hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting…
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ChatSidebarProps {
  conversations: Conversation[];
  loadingConversations: boolean;
  activeConvId: string | null;
  isChatLoading: boolean;
  deletingId: string | null;
  isMobileSidebarOpen: boolean;
  onCloseMobileSidebar: () => void;
  onSelectConversation: (conv: Conversation) => void;
  onNewChat: (conv: Conversation) => void;
  onTriggerDelete: (conv: Conversation) => void;
  onUpdateTitle: (id: string, title: string) => void;
}

export function ChatSidebar({
  conversations,
  loadingConversations,
  activeConvId,
  isChatLoading,
  deletingId,
  isMobileSidebarOpen,
  onCloseMobileSidebar,
  onSelectConversation,
  onNewChat,
  onTriggerDelete,
  onUpdateTitle,
}: ChatSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const handleNewChat = async () => {
    setIsCreatingChat(true);
    try {
      const res = await fetch("/api/ai/dashboard-chat/conversations", {
        method: "POST",
      });
      const { conversation } = await res.json();
      onNewChat(conversation);
    } catch {
      toast.error("Failed to create chat");
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleConfirmEdit = async (
    id: string,
    e: React.MouseEvent | React.KeyboardEvent,
  ) => {
    e.stopPropagation();
    if (!editTitle.trim()) return;
    await fetch(`/api/ai/dashboard-chat/conversations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle.trim() }),
    });
    onUpdateTitle(id, editTitle.trim());
    setEditingId(null);
  };

  const sidebarContent = (
    <aside className="h-full w-64 flex-col border-r border-border bg-surface shrink-0 flex">
      <div className="flex items-center justify-between border-b border-border p-4">
        <span className="text-sm font-semibold text-primary-text">Chats</span>
        <button
          onClick={handleNewChat}
          disabled={isCreatingChat}
          className="flex items-center gap-1 rounded-md bg-brand px-3 py-1.5 text-xs text-white transition hover:bg-brand/90 disabled:opacity-70 disabled:cursor-not-allowed border-none cursor-pointer"
        >
          {isCreatingChat ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          {isCreatingChat ? "Creating…" : "New"}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {loadingConversations ? (
          <div className="space-y-2 p-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-9 animate-pulse rounded-lg bg-surface-muted border border-border"
              />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-2 text-center text-secondary-text">
            <MessageSquare className="h-8 w-8 opacity-40" />
            <p className="text-xs">No conversations yet</p>
          </div>
        ) : (
          <ul className="space-y-0.5 m-0 p-0 list-none">
            {conversations.map((conv) => (
              <li key={conv.id}>
                <div
                  onClick={() => onSelectConversation(conv)}
                  className={`group flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    activeConvId === conv.id
                      ? "bg-surface-muted border border-border font-medium text-primary-text"
                      : "text-secondary-text hover:bg-surface-muted/50 hover:text-primary-text border border-transparent"
                  }`}
                >
                  {editingId === conv.id ? (
                    <div
                      className="flex flex-1 items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        autoFocus
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleConfirmEdit(conv.id, e);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="w-full rounded border border-border bg-surface px-1.5 py-0.5 text-xs text-primary-text outline-none focus:ring-1 focus:ring-brand"
                      />
                      <button
                        className="bg-transparent border-none cursor-pointer"
                        onClick={(e) => handleConfirmEdit(conv.id, e)}
                      >
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      </button>
                      <button
                        className="bg-transparent border-none cursor-pointer"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="h-3.5 w-3.5 text-red-500" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 truncate">{conv.title}</span>
                      {activeConvId === conv.id && isChatLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-secondary-text shrink-0" />
                      ) : (
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingId(conv.id);
                              setEditTitle(conv.title);
                            }}
                            className="rounded p-0.5 hover:text-primary-text bg-transparent border-none cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onTriggerDelete(conv);
                            }}
                            disabled={deletingId === conv.id}
                            className="rounded p-0.5 hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed bg-transparent border-none cursor-pointer"
                          >
                            {deletingId === conv.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </aside>
  );

  return (
    <>
      {/* Desktop: always visible */}
      <div className="hidden lg:flex h-full">{sidebarContent}</div>

      {/* Mobile/Tablet: slide-over overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-1010 flex lg:hidden"
          onClick={onCloseMobileSidebar}
        >
          <div
            className="h-full w-64 shrink-0 animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
          <div className="flex-1 bg-black/30" />
        </div>
      )}
    </>
  );
}

interface UseDashboardChatOptions {
  onAutoTitle: (convId: string, title: string) => void;
}

export function useDashboardChat({ onAutoTitle }: UseDashboardChatOptions) {
  const [loading, setLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<BackendChatMessage[]>([]);
  const [streamedResponse, setStreamedResponse] = useState("");

  const loadConversation = useCallback(async (convId: string) => {
    if (!convId) {
      setConversationId(null);
      setMessages([]);
      return;
    }

    setConversationId(convId);
    setIsChatLoading(true);

    try {
      const res = await fetch(
        `/api/ai/dashboard-chat/history?convId=${convId}`,
      );
      if (!res.ok) throw new Error("Failed to load history");
      const data = await res.json();
      setMessages(data.messages ?? []);
    } catch {
      toast.error("Failed to load chat history");
    } finally {
      setIsChatLoading(false);
    }
  }, []);

  const startNewConversation = useCallback((conv?: Conversation) => {
    setConversationId(conv?.id || null);
    setMessages([]);
  }, []);

  const saveMessage = async (role: "user" | "ai", content: string) => {
    if (!conversationId) return;
    try {
      const res = await fetch("/api/ai/dashboard-chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({ conversationId, role, content }),
      });
      if (!res.ok) {
        console.error("Failed to save message to database:", await res.text());
      }
    } catch (err) {
      console.error("Network error while saving message:", err);
    }
  };

  const sendMessage = async (input: string) => {
    if (!input.trim() || loading || !conversationId) return;

    setLoading(true);
    const userContent = input.trim();
    const isFirstMessage = messages.length === 0;

    const tempUserMessage: BackendChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userContent,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    await saveMessage("user", userContent);

    if (isFirstMessage)
      onAutoTitle(conversationId, userContent.slice(0, 60).trimEnd());
    setStreamedResponse("");

    try {
      const historyPayload = messages.map(m => ({ role: m.role, content: m.content }));
      
      const res = await fetch("/api/ai/dashboard-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userContent,
          history: historyPayload
        }),
      });
      if (!res.body) throw new Error("No response");

      const reader = res.body.getReader();
      let aiFullMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        aiFullMessage += new TextDecoder().decode(value);
        setStreamedResponse(aiFullMessage);
      }

      await saveMessage("ai", aiFullMessage);

      const tempAiMessage: BackendChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: aiFullMessage,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempAiMessage]);
    } catch {
      toast.error("Chat error — please try again");
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
    } finally {
      setLoading(false);
      setStreamedResponse("");
    }
  };

  return {
    loading,
    isChatLoading,
    messages,
    streamedResponse,
    conversationId,
    sendMessage,
    loadConversation,
    startNewConversation,
  };
}

interface ChatMessageListProps {
  messages: BackendChatMessage[];
  streamedResponse: string;
  loading: boolean;
  isChatLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatMessageList({
  messages,
  streamedResponse,
  loading,
  isChatLoading,
  messagesEndRef,
}: ChatMessageListProps) {
  if (isChatLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="flex justify-end">
          <div className="w-2/3 max-w-[85%] h-14 bg-surface-muted border border-border rounded-2xl rounded-br-sm animate-pulse" />
        </div>
        <div className="flex justify-start">
          <div className="w-3/4 max-w-[85%] h-24 bg-surface border border-border rounded-2xl rounded-bl-sm animate-pulse" />
        </div>
        <div className="flex justify-end">
          <div className="w-1/2 max-w-[85%] h-14 bg-surface-muted border border-border rounded-2xl rounded-br-sm animate-pulse" />
        </div>
      </div>
    );
  }

  const welcomeMessage: BackendChatMessage = {
    id: "welcome",
    role: "system",
    content:
      "Hi! I am your Zerra Platform Concierge. How can I help you today?",
    createdAt: "",
  };

  const displayMessages = messages.length === 0 ? [welcomeMessage] : messages;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
      {displayMessages.map((msg, i) => (
        <div
          key={msg.id || i}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[85%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed ${
              msg.role === "user"
                ? "bg-brand text-white rounded-br-sm"
                : "bg-surface-muted border border-border text-primary-text rounded-bl-sm shadow-sm"
            }`}
          >
            <div
              className={`prose dark:prose-invert max-w-none prose-a:font-bold prose-p:leading-relaxed ${
                msg.role === "user"
                  ? "text-white **:text-white"
                  : "prose-a:text-brand"
              }`}
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      ))}

      {streamedResponse && (
        <div className="flex justify-start">
          <div className="max-w-[85%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed bg-surface-muted border border-border text-primary-text rounded-bl-sm shadow-sm">
            <div className="prose dark:prose-invert max-w-none prose-a:text-brand prose-a:font-bold prose-p:leading-relaxed">
              <ReactMarkdown>{streamedResponse}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {loading &&
        !streamedResponse &&
        messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="bg-surface-muted border border-border rounded-2xl rounded-bl-sm shadow-sm px-5 py-4 max-w-[85%] flex items-center gap-1.5">
              <div
                className="w-2 h-2 bg-secondary-text rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-2 h-2 bg-secondary-text rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-2 h-2 bg-secondary-text rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}
      <div ref={messagesEndRef} className="float-left clear-both h-1" />
    </div>
  );
}

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border-t border-border bg-surface flex gap-3 items-end"
    >
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? "AI is responding..." : "Ask anything..."}
        className="flex-1 max-h-32 min-h-[44px] bg-surface-muted border border-border rounded-xl px-4 py-3 text-primary-text text-[15px] focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={disabled}
        rows={1}
      />
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        className={`h-[44px] px-6 rounded-xl font-bold text-[15px] border-none transition-colors ${
          input.trim() && !disabled
            ? "bg-brand text-white cursor-pointer hover:bg-brand/90"
            : "bg-surface-muted border border-border text-secondary-text cursor-not-allowed"
        }`}
      >
        Send
      </button>
    </form>
  );
}

export default function DashboardAiChatModal() {
  const router = useRouter();
  const [showFabText, setShowFabText] = useState(true);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowFabText(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    setNavigating(true);
    router.push("/learner/concierge");
  };

  return (
    <button
      onClick={handleClick}
      disabled={navigating}
      className={`fixed bottom-6 right-6 z-1000 h-14 px-4 bg-brand text-white rounded-full shadow-[0_4px_20px_rgba(255,0,4,0.3)] flex items-center justify-center hover:scale-105 transition-all duration-500 ease-in-out border-none cursor-pointer group ${navigating ? "opacity-80 cursor-wait" : ""}`}
      aria-label="Open AI Concierge Chat"
    >
      {navigating ? (
        <Loader2 className="w-6 h-6 shrink-0 animate-spin" />
      ) : (
        <Sparkles className="w-6 h-6 shrink-0" />
      )}
      <span
        className={`font-semibold text-sm whitespace-nowrap overflow-hidden transition-all duration-500 ease-in-out flex items-center ${
          navigating
            ? "max-w-[150px] ml-2 opacity-100"
            : showFabText
              ? "max-w-[150px] ml-2 opacity-100"
              : "max-w-0 ml-0 opacity-0 md:max-w-[150px] md:ml-2 md:opacity-100"
        }`}
      >
        {navigating ? "Loading…" : "Chat with Zerra"}
      </span>
    </button>
  );
}


