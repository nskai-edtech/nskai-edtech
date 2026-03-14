"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Trash2, Loader2, Menu, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import {
  ChatSidebar,
  ChatMessageList,
  ChatInput,
  ConfirmDeleteModal,
  useDashboardChat,
  type Conversation,
} from "@/components/dashboard/DashboardAiChatModal";

export default function ConciergePage() {
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [pendingDeleteConv, setPendingDeleteConv] =
    useState<Conversation | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    loading,
    isChatLoading,
    messages,
    streamedResponse,
    conversationId,
    sendMessage,
    loadConversation,
    startNewConversation,
  } = useDashboardChat({
    onAutoTitle: (id, title) =>
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title } : c)),
      ),
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleConfirmDelete = async () => {
    if (!pendingDeleteConv) return;
    setDeletingId(pendingDeleteConv.id);
    try {
      await fetch(
        `/api/ai/dashboard-chat/conversations/${pendingDeleteConv.id}`,
        { method: "DELETE" },
      );
      setConversations((prev) =>
        prev.filter((c) => c.id !== pendingDeleteConv.id),
      );
      if (conversationId === pendingDeleteConv.id) startNewConversation();
      setPendingDeleteConv(null);
    } catch {
      toast.error("Failed to delete chat");
    } finally {
      setDeletingId(null);
    }
  };

  const loadConversationsOnMount = useCallback(() => {
    setLoadingConversations(true);

    fetch("/api/ai/dashboard-chat/conversations")
      .then((r) => r.json())
      .then((d) => {
        const fetchedConvs = d.conversations ?? [];
        setConversations(fetchedConvs);

        if (fetchedConvs.length > 0) {
          loadConversation(fetchedConvs[0].id);
        } else {
          fetch("/api/ai/dashboard-chat/conversations", { method: "POST" })
            .then((res) => res.json())
            .then(({ conversation }) => {
              setConversations([conversation]);
              startNewConversation(conversation);
            })
            .catch(() => toast.error("Failed to start chat"));
        }
      })
      .catch(() => toast.error("Failed to load conversations"))
      .finally(() => setLoadingConversations(false));
  }, [loadConversation, startNewConversation]);

  useEffect(() => {
    loadConversationsOnMount();
  }, [loadConversationsOnMount]);

  useEffect(() => {
    if (messagesEndRef.current && !isChatLoading) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [messages, streamedResponse, loading, isChatLoading]);

  const handleNewChatFromHeader = async () => {
    setIsCreatingNewChat(true);
    try {
      const res = await fetch("/api/ai/dashboard-chat/conversations", {
        method: "POST",
      });
      const { conversation } = await res.json();
      setConversations((prev) => [conversation, ...prev]);
      startNewConversation(conversation);
    } finally {
      setIsCreatingNewChat(false);
    }
  };

  return (
    <>
      {pendingDeleteConv && (
        <ConfirmDeleteModal
          title={pendingDeleteConv.title}
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDeleteConv(null)}
          isDeleting={deletingId !== null}
        />
      )}
      {loadingConversations ? (
        <div className="w-full h-full flex items-center justify-center bg-surface">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-brand/20 animate-ping" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 border border-brand/20">
                <Sparkles className="h-8 w-8 text-brand animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-lg font-bold text-primary-text">
                Loading Zerra Concierge
              </h2>
              <p className="text-sm text-secondary-text">
                Preparing your chat experience…
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full bg-brand animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-2 h-2 rounded-full bg-brand animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-2 h-2 rounded-full bg-brand animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex overflow-hidden">
          <ChatSidebar
            conversations={conversations}
            loadingConversations={loadingConversations}
            activeConvId={conversationId}
            isChatLoading={isChatLoading}
            deletingId={deletingId}
            isMobileSidebarOpen={mobileSidebarOpen}
            onCloseMobileSidebar={() => setMobileSidebarOpen(false)}
            onSelectConversation={(conv) => {
              loadConversation(conv.id);
              setMobileSidebarOpen(false);
            }}
            onNewChat={(conv) => {
              setConversations((prev) => [conv, ...prev]);
              startNewConversation(conv);
              setMobileSidebarOpen(false);
            }}
            onTriggerDelete={(conv) => {
              setPendingDeleteConv(conv);
              setMobileSidebarOpen(false);
            }}
            onUpdateTitle={(id, title) =>
              setConversations((prev) =>
                prev.map((c) => (c.id === id ? { ...c, title } : c)),
              )
            }
          />

          <div className="flex-1 flex flex-col min-w-0 bg-surface">
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-border flex justify-between items-center bg-surface">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-secondary-text hover:text-primary-text hover:bg-surface-muted transition-colors bg-transparent border-none cursor-pointer"
                  title="Open chat history"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-bold text-primary-text flex items-center gap-2">
                  <span className="text-brand">✨</span> Zerra Concierge
                </h2>
              </div>
              <div className="flex items-center gap-3">
                {conversationId && (
                  <button
                    onClick={() =>
                      setPendingDeleteConv(
                        conversations.find((c) => c.id === conversationId) ||
                          null,
                      )
                    }
                    className="text-red-500/80 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center w-8 h-8 rounded-full hover:bg-red-500/10"
                    title="Delete current chat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleNewChatFromHeader}
                  disabled={isCreatingNewChat}
                  className="text-xs font-bold text-brand bg-brand/10 px-3 py-1.5 rounded-lg hover:bg-brand/20 transition-colors border-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {isCreatingNewChat ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    "New Chat"
                  )}
                </button>
              </div>
            </div>

            {/* Messages */}
            <ChatMessageList
              messages={messages}
              streamedResponse={streamedResponse}
              loading={loading}
              isChatLoading={isChatLoading}
              messagesEndRef={messagesEndRef}
            />

            {/* Input */}
            <ChatInput onSend={sendMessage} disabled={loading} />
          </div>
        </div>
      )}
    </>
  );
}
