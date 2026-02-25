import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { assignmentSubmissionStatusEnum } from "./enums";
import { courses, lessons } from "./courses";
import { users } from "./users";

export const assignments = pgTable(
  "assignment",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    courseId: uuid("course_id")
      .references(() => courses.id, { onDelete: "cascade" })
      .notNull(),
    lessonId: uuid("lesson_id")
      .references(() => lessons.id, { onDelete: "cascade" })
      .notNull()
      .unique(), // One assignment per lesson
    title: text("title").notNull(),
    description: text("description"), // Rich text
    maxScore: integer("max_score").default(100).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("assignment_course_id_idx").on(table.courseId),
    index("assignment_lesson_id_idx").on(table.lessonId),
  ],
);

export const assignmentSubmissions = pgTable(
  "assignment_submission",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    assignmentId: uuid("assignment_id")
      .references(() => assignments.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    fileUrl: text("file_url").notNull(), // From UploadThing
    status: assignmentSubmissionStatusEnum("status")
      .default("PENDING")
      .notNull(),
    score: integer("score"),
    feedback: text("feedback"),
    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
    gradedAt: timestamp("graded_at"),
  },
  (table) => [
    index("submission_assignment_id_idx").on(table.assignmentId),
    index("submission_user_id_idx").on(table.userId),
    index("submission_status_idx").on(table.status),
  ],
);

// --- RELATIONS ---

export const assignmentRelations = relations(assignments, ({ one, many }) => ({
  course: one(courses, {
    fields: [assignments.courseId],
    references: [courses.id],
  }),
  lesson: one(lessons, {
    fields: [assignments.lessonId],
    references: [lessons.id],
  }),
  submissions: many(assignmentSubmissions),
}));

export const assignmentSubmissionRelations = relations(
  assignmentSubmissions,
  ({ one }) => ({
    assignment: one(assignments, {
      fields: [assignmentSubmissions.assignmentId],
      references: [assignments.id],
    }),
    user: one(users, {
      fields: [assignmentSubmissions.userId],
      references: [users.id],
    }),
  }),
);
