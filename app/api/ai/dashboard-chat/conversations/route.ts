import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { dashboardChatConversations } from "@/drizzle/schema/chat";
import { users } from "@/drizzle/schema/users";
import { eq, desc } from "drizzle-orm";

async function getInternalUser(clerkId: string) {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);
  return user ?? null;
}

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getInternalUser(clerkId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const conversations = await db
      .select()
      .from(dashboardChatConversations)
      .where(eq(dashboardChatConversations.userId, user.id))
      .orderBy(desc(dashboardChatConversations.updatedAt));

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("[DASHBOARD_CHAT_CONVERSATIONS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getInternalUser(clerkId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [conversation] = await db
      .insert(dashboardChatConversations)
      .values({ userId: user.id, title: "New Chat" })
      .returning();

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    console.error("[DASHBOARD_CHAT_CONVERSATIONS_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
