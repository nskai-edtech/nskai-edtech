import {
  pgTable,
  uuid,
  text,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { lessons } from "./courses";

export const userNotes = pgTable(
  "user_notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    lessonId: uuid("lesson_id")
      .references(() => lessons.id, { onDelete: "cascade" })
      .notNull(),
    content: text("content"), // Rich Text HTML
    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("user_notes_user_lesson_idx").on(table.userId, table.lessonId),
  ],
);

export const questions = pgTable(
  "question",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    lessonId: uuid("lesson_id")
      .references(() => lessons.id, { onDelete: "cascade" })
      .notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("question_lesson_id_idx").on(table.lessonId),

    index("question_user_id_idx").on(table.userId),
  ],
);

export const answers = pgTable(
  "answer",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    questionId: uuid("question_id")
      .references(() => questions.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("answer_question_id_idx").on(table.questionId),
    index("answer_user_id_idx").on(table.userId),
  ],
);

// --- RELATIONS ---

export const userNoteRelations = relations(userNotes, ({ one }) => ({
  user: one(users, {
    fields: [userNotes.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [userNotes.lessonId],
    references: [lessons.id],
  }),
}));

export const questionRelations = relations(questions, ({ one, many }) => ({
  user: one(users, {
    fields: [questions.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [questions.lessonId],
    references: [lessons.id],
  }),
  answers: many(answers),
}));

export const answerRelations = relations(answers, ({ one }) => ({
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
  user: one(users, {
    fields: [answers.userId],
    references: [users.id],
  }),
}));
