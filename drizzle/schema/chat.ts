import {
  pgTable,
  uuid,
  text,
  timestamp,
  uniqueIndex,
  index,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { lessons } from "./courses";
import { pgEnum } from "drizzle-orm/pg-core";

export const chatRoleEnum = pgEnum("chat_role", ["user", "ai"]);

// One conversation per user + lesson pair
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
    index("ai_chat_msg_order_idx").on(
      table.conversationId,
      table.orderIndex,
    ),
  ],
);

// --- RELATIONS ---

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
