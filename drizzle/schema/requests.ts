import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { requestTypeEnum, requestStatusEnum } from "./enums";
import { courses } from "./courses";
import { users } from "./users";

export const courseRequests = pgTable(
  "course_request",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    courseId: uuid("course_id")
      .references(() => courses.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    type: requestTypeEnum("type").notNull(),
    reason: text("reason").notNull(),
    status: requestStatusEnum("status").default("PENDING").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    resolvedAt: timestamp("resolved_at"),
  },
  (table) => [
    index("course_request_course_id_idx").on(table.courseId),
    index("course_request_user_id_idx").on(table.userId),
    index("course_request_status_idx").on(table.status),
  ],
);

export const courseRequestRelations = relations(courseRequests, ({ one }) => ({
  course: one(courses, {
    fields: [courseRequests.courseId],
    references: [courses.id],
  }),
  user: one(users, {
    fields: [courseRequests.userId],
    references: [users.id],
  }),
}));
