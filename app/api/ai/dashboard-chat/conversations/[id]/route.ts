import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { dashboardChatConversations } from "@/drizzle/schema/chat";
import { users } from "@/drizzle/schema/users";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

async function getInternalUser(clerkId: string) {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);
  return user ?? null;
}

const patchSchema = z.object({
  title: z.string().min(1).max(100),
});

// PATCH /api/ai/dashboard-chat/conversations/[id]
// Renames a conversation
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
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
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { id } = await context.params;

    const [updated] = await db
      .update(dashboardChatConversations)
      .set({ title: parsed.data.title })
      .where(
        and(
          eq(dashboardChatConversations.id, id),
          eq(dashboardChatConversations.userId, user.id), // ✅ ensures ownership
        ),
      )
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ conversation: updated });
  } catch (error) {
    console.error("[DASHBOARD_CHAT_CONVERSATIONS_PATCH]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/ai/dashboard-chat/conversations/[id]
// Deletes a conversation and all its messages (cascade handles messages)
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getInternalUser(clerkId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await context.params;

    const [deleted] = await db
      .delete(dashboardChatConversations)
      .where(
        and(
          eq(dashboardChatConversations.id, id),
          eq(dashboardChatConversations.userId, user.id), // ✅ ensures ownership
        ),
      )
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DASHBOARD_CHAT_CONVERSATIONS_DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
