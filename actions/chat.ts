"use server";

import { db } from "@/lib/db";
import { aiChatConversations, aiChatMessages, users } from "@/drizzle/schema";
import { eq, and, asc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

// Helper: resolve internal user ID from Clerk session
async function getDbUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
    columns: { id: true },
  });

  return user ?? null;
}

// GET OR CREATE a conversation for a user + lesson pair
export async function getOrCreateConversation(lessonId: string) {
  try {
    const user = await getDbUser();
    if (!user) return { error: "Unauthorized" };

    // Try to find existing conversation
    const existing = await db.query.aiChatConversations.findFirst({
      where: and(
        eq(aiChatConversations.userId, user.id),
        eq(aiChatConversations.lessonId, lessonId),
      ),
    });

    if (existing) return { conversationId: existing.id };

    // Create new conversation
    const [created] = await db
      .insert(aiChatConversations)
      .values({
        userId: user.id,
        lessonId,
      })
      .onConflictDoNothing()
      .returning({ id: aiChatConversations.id });

    // Handle potential race condition — re-fetch if insert was a no-op
    if (!created) {
      const refetched = await db.query.aiChatConversations.findFirst({
        where: and(
          eq(aiChatConversations.userId, user.id),
          eq(aiChatConversations.lessonId, lessonId),
        ),
      });
      return { conversationId: refetched!.id };
    }

    return { conversationId: created.id };
  } catch (error) {
    console.error("[GET_OR_CREATE_CONVERSATION]", error);
    return { error: "Internal Server Error" };
  }
}

// GET CHAT HISTORY for a conversation
export async function getChatHistory(conversationId: string) {
  try {
    const user = await getDbUser();
    if (!user) return { error: "Unauthorized" };

    // Verify the conversation belongs to this user
    const conversation = await db.query.aiChatConversations.findFirst({
      where: and(
        eq(aiChatConversations.id, conversationId),
        eq(aiChatConversations.userId, user.id),
      ),
    });

    if (!conversation) return { error: "Conversation not found" };

    const messages = await db.query.aiChatMessages.findMany({
      where: eq(aiChatMessages.conversationId, conversationId),
      orderBy: [asc(aiChatMessages.orderIndex)],
      columns: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
      },
    });

    return { messages };
  } catch (error) {
    console.error("[GET_CHAT_HISTORY]", error);
    return { error: "Internal Server Error" };
  }
}

// SAVE A MESSAGE to a conversation
export async function saveChatMessage(
  conversationId: string,
  role: "user" | "ai",
  content: string,
) {
  try {
    const user = await getDbUser();
    if (!user) return { error: "Unauthorized" };

    // Verify ownership
    const conversation = await db.query.aiChatConversations.findFirst({
      where: and(
        eq(aiChatConversations.id, conversationId),
        eq(aiChatConversations.userId, user.id),
      ),
    });

    if (!conversation) return { error: "Conversation not found" };

    const [message] = await db
      .insert(aiChatMessages)
      .values({
        conversationId,
        role,
        content,
      })
      .returning({ id: aiChatMessages.id });

    // Touch the conversation updatedAt
    await db
      .update(aiChatConversations)
      .set({ updatedAt: new Date() })
      .where(eq(aiChatConversations.id, conversationId));

    return { messageId: message.id };
  } catch (error) {
    console.error("[SAVE_CHAT_MESSAGE]", error);
    return { error: "Internal Server Error" };
  }
}

// CLEAR CHAT HISTORY for a conversation
export async function clearChatHistory(conversationId: string) {
  try {
    const user = await getDbUser();
    if (!user) return { error: "Unauthorized" };

    const conversation = await db.query.aiChatConversations.findFirst({
      where: and(
        eq(aiChatConversations.id, conversationId),
        eq(aiChatConversations.userId, user.id),
      ),
    });

    if (!conversation) return { error: "Conversation not found" };

    await db
      .delete(aiChatMessages)
      .where(eq(aiChatMessages.conversationId, conversationId));

    return { success: true };
  } catch (error) {
    console.error("[CLEAR_CHAT_HISTORY]", error);
    return { error: "Internal Server Error" };
  }
}
