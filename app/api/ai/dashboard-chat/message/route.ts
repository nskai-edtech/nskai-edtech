import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import {
  dashboardChatConversations,
  dashboardChatMessages,
} from "@/drizzle/schema/chat";
import { users } from "@/drizzle/schema/users";
import { eq, and, count } from "drizzle-orm";
import { z } from "zod";

async function getInternalUser(clerkId: string) {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);
  return user ?? null;
}

const messageSchema = z.object({
  conversationId: z.string().uuid(),
  role: z.enum(["user", "ai"]),
  content: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getInternalUser(clerkId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = messageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { conversationId, role, content } = parsed.data;

    // Verify conversation belongs to this user
    const [conversation] = await db
      .select()
      .from(dashboardChatConversations)
      .where(
        and(
          eq(dashboardChatConversations.id, conversationId),
          eq(dashboardChatConversations.userId, user.id),
        ),
      )
      .limit(1);

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    const dbRole = role === "user" ? "user" : "ai";
    // Insert the message
    const [msg] = await db
      .insert(dashboardChatMessages)
      .values({ conversationId, role: dbRole, content })
      .returning();

    // Auto-title the conversation from the first user message
    if (role === "user" && conversation.title === "New Chat") {
      const [{ messageCount }] = await db
        .select({ messageCount: count() })
        .from(dashboardChatMessages)
        .where(eq(dashboardChatMessages.conversationId, conversationId));

      if (messageCount === 1) {
        const autoTitle = content.slice(0, 60).trimEnd();
        await db
          .update(dashboardChatConversations)
          .set({ title: autoTitle })
          .where(eq(dashboardChatConversations.id, conversationId));
      }
    }

    return NextResponse.json({ message: msg }, { status: 201 });
  } catch (error) {
    console.error("[DASHBOARD_CHAT_MESSAGES_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
