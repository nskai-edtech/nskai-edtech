import {
  pgTable,
  uuid,
  text,
  timestamp,
  uniqueIndex,
  index,
  serial,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { lessons } from "./courses";

// --- ENUMS ---
export const chatRoleEnum = pgEnum("chat_role", ["user", "ai"]);

// --- AI CHAT (per lesson) ---
export const aiChatConversations = pgTable(
  "ai_chat_conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    lessonId: uuid("lesson_id")
      .references(() => lessons.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("ai_chat_conv_user_lesson_idx").on(
      table.userId,
      table.lessonId,
    ),
    index("ai_chat_conv_user_id_idx").on(table.userId),
    index("ai_chat_conv_lesson_id_idx").on(table.lessonId),
  ],
);

export const aiChatMessages = pgTable(
  "ai_chat_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .references(() => aiChatConversations.id, { onDelete: "cascade" })
      .notNull(),
    role: chatRoleEnum("role").notNull(),
    content: text("content").notNull(),
    orderIndex: serial("order_index").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("ai_chat_msg_conv_id_idx").on(table.conversationId),
    index("ai_chat_msg_order_idx").on(table.conversationId, table.orderIndex),
  ],
);

// --- AI CHAT RELATIONS ---
export const aiChatConversationRelations = relations(
  aiChatConversations,
  ({ one, many }) => ({
    user: one(users, {
      fields: [aiChatConversations.userId],
      references: [users.id],
    }),
    lesson: one(lessons, {
      fields: [aiChatConversations.lessonId],
      references: [lessons.id],
    }),
    messages: many(aiChatMessages),
  }),
);

export const aiChatMessageRelations = relations(aiChatMessages, ({ one }) => ({
  conversation: one(aiChatConversations, {
    fields: [aiChatMessages.conversationId],
    references: [aiChatConversations.id],
  }),
}));

// --- DASHBOARD CHAT (platform concierge) ---
export const dashboardChatConversations = pgTable(
  "dashboard_chat_conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    title: text("title").default("New Chat").notNull(), // ✅ added for sidebar display
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    // ✅ removed uniqueIndex — users can now have many conversations
    index("dashboard_chat_conv_user_id_idx").on(table.userId),
  ],
);

export const dashboardChatMessages = pgTable(
  "dashboard_chat_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .references(() => dashboardChatConversations.id, { onDelete: "cascade" })
      .notNull(),
    role: chatRoleEnum("role").notNull(),
    content: text("content").notNull(),
    orderIndex: serial("order_index").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("dashboard_chat_msg_conv_id_idx").on(table.conversationId),
    index("dashboard_chat_msg_order_idx").on(
      table.conversationId,
      table.orderIndex,
    ),
  ],
);

// --- DASHBOARD CHAT RELATIONS ---
export const dashboardChatConversationRelations = relations(
  dashboardChatConversations,
  ({ one, many }) => ({
    user: one(users, {
      fields: [dashboardChatConversations.userId],
      references: [users.id],
    }),
    messages: many(dashboardChatMessages),
  }),
);

export const dashboardChatMessageRelations = relations(
  dashboardChatMessages,
  ({ one }) => ({
    conversation: one(dashboardChatConversations, {
      fields: [dashboardChatMessages.conversationId],
      references: [dashboardChatConversations.id],
    }),
  }),
);
