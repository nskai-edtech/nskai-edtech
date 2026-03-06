import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import {
  dashboardChatConversations,
  dashboardChatMessages,
} from "@/drizzle/schema/chat";
import { users } from "@/drizzle/schema/users";
import { eq, asc, and } from "drizzle-orm";

async function getInternalUser(clerkId: string) {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);
  return user ?? null;
}

export async function GET(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getInternalUser(clerkId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const convId = searchParams.get("convId");
    if (!convId) {
      return NextResponse.json(
        { error: "convId query param is required" },
        { status: 400 },
      );
    }

    // Verify the conversation belongs to this user
    const [conversation] = await db
      .select()
      .from(dashboardChatConversations)
      .where(
        and(
          eq(dashboardChatConversations.id, convId),
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

    const messages = await db
      .select()
      .from(dashboardChatMessages)
      .where(eq(dashboardChatMessages.conversationId, conversation.id))
      .orderBy(asc(dashboardChatMessages.orderIndex));

    return NextResponse.json({ conversationId: conversation.id, messages });
  } catch (error) {
    console.error("[DASHBOARD_CHAT_HISTORY_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
