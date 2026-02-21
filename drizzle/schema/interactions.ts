import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { courses, lessons } from "./courses";

export const purchases = pgTable("purchase", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  courseId: uuid("course_id").references(() => courses.id, {
    onDelete: "cascade",
  }),

  // Paystack Verification
  paystackReference: text("paystack_reference").unique().notNull(),
  amount: integer("amount").notNull(),
  status: text("status").default("success"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable(
  "review",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    courseId: uuid("course_id")
      .references(() => courses.id, { onDelete: "cascade" })
      .notNull(),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("review_user_course_idx").on(t.userId, t.courseId)],
);

export const courseLikes = pgTable(
  "course_like",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    courseId: uuid("course_id")
      .references(() => courses.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("course_like_user_course_idx").on(t.userId, t.courseId)],
);

export const userProgress = pgTable(
  "user_progress",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    lessonId: uuid("lesson_id")
      .references(() => lessons.id, {
        onDelete: "cascade",
      })
      .notNull(),
    isCompleted: boolean("is_completed").default(false),
    lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
  },
  (t) => [
    uniqueIndex("user_progress_user_lesson_idx").on(t.userId, t.lessonId),
  ],
);

export const purchaseRelations = relations(purchases, ({ one }) => ({
  user: one(users, {
    fields: [purchases.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [purchases.courseId],
    references: [courses.id],
  }),
}));

export const reviewRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [reviews.courseId],
    references: [courses.id],
  }),
}));

export const courseLikeRelations = relations(courseLikes, ({ one }) => ({
  user: one(users, {
    fields: [courseLikes.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [courseLikes.courseId],
    references: [courses.id],
  }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [userProgress.lessonId],
    references: [lessons.id],
  }),
}));
