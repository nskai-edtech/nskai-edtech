import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { courseStatusEnum, lessonTypeEnum } from "./enums";
import { users } from "./users";
import { purchases, userProgress, reviews, courseLikes } from "./interactions";
import { userNotes, questions } from "./qa";
import { assignments } from "./assessments";
import { courseRequests } from "./requests";
import { certificates } from "./certificates";
import { courseSkills } from "./skills";

export const courses = pgTable(
  "course",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    tutorId: uuid("tutor_id").references(() => users.id, {
      onDelete: "set null",
    }),
    price: integer("price"),
    status: courseStatusEnum("status").default("DRAFT").notNull(),
    imageUrl: text("image_url"),
    tags: text("tags").array().default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("course_tutor_id_idx").on(table.tutorId),
    index("course_status_idx").on(table.status),
  ],
);

export const chapters = pgTable(
  "chapter",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, {
        onDelete: "cascade",
      }),
    title: text("title").notNull(),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("chapter_course_id_idx").on(table.courseId)],
);

export const lessons = pgTable(
  "lesson",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    chapterId: uuid("chapter_id").references(() => chapters.id, {
      onDelete: "cascade",
    }),
    title: text("title").notNull(),
    description: text("description"),
    videoUrl: text("video_url"),
    position: integer("position").notNull(),
    isFreePreview: boolean("is_free_preview").default(false),
    notes: text("notes"),
    type: lessonTypeEnum("type").default("VIDEO").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("lesson_chapter_id_idx").on(table.chapterId)],
);

export const quizQuestions = pgTable(
  "quiz_question",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    lessonId: uuid("lesson_id")
      .references(() => lessons.id, { onDelete: "cascade" })
      .notNull(),
    questionText: text("question_text").notNull(),
    options: text("options").array().notNull(),
    correctOption: integer("correct_option").notNull(),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("quiz_question_lesson_id_idx").on(table.lessonId)],
);

export const userQuizAttempts = pgTable(
  "user_quiz_attempt",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    lessonId: uuid("lesson_id")
      .references(() => lessons.id, { onDelete: "cascade" })
      .notNull(),
    score: integer("score").notNull(),
    passed: boolean("passed").notNull().default(false),
    answers: jsonb("answers").$type<Record<string, number>>().default({}),
    completedAt: timestamp("completed_at").defaultNow().notNull(),
  },
  (table) => [
    index("quiz_attempt_user_lesson_idx").on(table.userId, table.lessonId),
  ],
);

export const muxData = pgTable(
  "mux_data",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    lessonId: uuid("lesson_id")
      .references(() => lessons.id, { onDelete: "cascade" })
      .unique(),
    assetId: text("asset_id").notNull(),
    playbackId: text("playback_id"),
  },
  (table) => [index("mux_data_asset_id_idx").on(table.assetId)],
);

// --- RELATIONS ---

export const courseRelations = relations(courses, ({ one, many }) => ({
  tutor: one(users, {
    fields: [courses.tutorId],
    references: [users.id],
  }),
  chapters: many(chapters),
  purchases: many(purchases),
  reviews: many(reviews),
  courseLikes: many(courseLikes),
  assignments: many(assignments),
  courseRequests: many(courseRequests),
  certificates: many(certificates),
  courseSkills: many(courseSkills),
}));

export const chapterRelations = relations(chapters, ({ one, many }) => ({
  course: one(courses, {
    fields: [chapters.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
}));

export const lessonRelations = relations(lessons, ({ one, many }) => ({
  chapter: one(chapters, {
    fields: [lessons.chapterId],
    references: [chapters.id],
  }),
  muxData: one(muxData),
  userProgress: many(userProgress),
  userNotes: many(userNotes),
  questions: many(questions),
  quizQuestions: many(quizQuestions),
  quizAttempts: many(userQuizAttempts),
  assignment: one(assignments),
}));

export const quizQuestionRelations = relations(quizQuestions, ({ one }) => ({
  lesson: one(lessons, {
    fields: [quizQuestions.lessonId],
    references: [lessons.id],
  }),
}));

export const userQuizAttemptRelations = relations(
  userQuizAttempts,
  ({ one }) => ({
    user: one(users, {
      fields: [userQuizAttempts.userId],
      references: [users.id],
    }),
    lesson: one(lessons, {
      fields: [userQuizAttempts.lessonId],
      references: [lessons.id],
    }),
  }),
);

export const muxDataRelations = relations(muxData, ({ one }) => ({
  lesson: one(lessons, {
    fields: [muxData.lessonId],
    references: [lessons.id],
  }),
}));
