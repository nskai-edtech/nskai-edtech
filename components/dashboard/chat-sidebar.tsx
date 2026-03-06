"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MessageSquare,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  Loader2,
} from "lucide-react";

type Conversation = {
  id: string;
  title: string;
  updatedAt: string;
};

export function ChatSidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const activeId = searchParams.get("convId");

  useEffect(() => {
    fetch("/api/ai/dashboard-chat/conversations")
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSwitchingId(null);
  }, [activeId]);

  const handleNewChat = async () => {
    const res = await fetch("/api/ai/dashboard-chat/conversations", {
      method: "POST",
    });
    const { conversation } = await res.json();
    setConversations((prev) => [conversation, ...prev]);
    setSwitchingId(conversation.id);
    router.push(`/dashboard/chat?convId=${conversation.id}`);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(`/api/ai/dashboard-chat/conversations/${id}`, {
      method: "DELETE",
    });
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) {
      router.push("/dashboard/chat");
    }
  };

  const handleStartEdit = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
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
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: editTitle.trim() } : c)),
    );
    setEditingId(null);
  };

  const handleCancelEdit = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-background shrink-0">
      <div className="flex items-center justify-between border-b p-4">
        <span className="text-sm font-semibold text-foreground">Chats</span>
        <button
          onClick={handleNewChat}
          className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground transition hover:bg-primary/90"
        >
          <Plus className="h-3.5 w-3.5" />
          New
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="space-y-2 p-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-9 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-2 text-center text-muted-foreground">
            <MessageSquare className="h-8 w-8 opacity-40" />
            <p className="text-xs">No conversations yet</p>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {conversations.map((conv) => (
              <li key={conv.id}>
                <div
                  onClick={() => {
                    setSwitchingId(conv.id);
                    router.push(`/dashboard/chat?convId=${conv.id}`);
                  }}
                  className={`group flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors
                    ${
                      activeId === conv.id || switchingId === conv.id
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
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
                          if (e.key === "Escape") handleCancelEdit(e);
                        }}
                        className="w-full rounded border bg-background px-1.5 py-0.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button onClick={(e) => handleConfirmEdit(conv.id, e)}>
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      </button>
                      <button onClick={(e) => handleCancelEdit(e)}>
                        <X className="h-3.5 w-3.5 text-red-500" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 truncate">{conv.title}</span>
                      {switchingId === conv.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground shrink-0" />
                      ) : (
                        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={(e) => handleStartEdit(conv, e)}
                            className="rounded p-0.5 hover:text-foreground"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(conv.id, e)}
                            className="rounded p-0.5 hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
}
