import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { courses } from "./courses";

export const learningPaths = pgTable("learning_path", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  price: integer("price"),
  isPublished: boolean("is_published").default(false),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const learningPathCourses = pgTable("learning_path_course", {
  id: uuid("id").defaultRandom().primaryKey(),
  learningPathId: uuid("learning_path_id")
    .references(() => learningPaths.id, { onDelete: "cascade" })
    .notNull(),
  courseId: uuid("course_id")
    .references(() => courses.id, { onDelete: "cascade" })
    .notNull(),
  position: integer("position").notNull(),
});

export const userLearningPaths = pgTable("user_learning_path", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  learningPathId: uuid("learning_path_id")
    .references(() => learningPaths.id, { onDelete: "cascade" })
    .notNull(),
  paystackReference: text("paystack_reference"),
  amount: integer("amount"),
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const learningPathRelations = relations(learningPaths, ({ many }) => ({
  courses: many(learningPathCourses),
  enrollments: many(userLearningPaths),
}));

export const learningPathCoursesRelations = relations(
  learningPathCourses,
  ({ one }) => ({
    learningPath: one(learningPaths, {
      fields: [learningPathCourses.learningPathId],
      references: [learningPaths.id],
    }),
    course: one(courses, {
      fields: [learningPathCourses.courseId],
      references: [courses.id],
    }),
  }),
);

export const userLearningPathsRelations = relations(
  userLearningPaths,
  ({ one }) => ({
    user: one(users, {
      fields: [userLearningPaths.userId],
      references: [users.id],
    }),
    learningPath: one(learningPaths, {
      fields: [userLearningPaths.learningPathId],
      references: [learningPaths.id],
    }),
  }),
);
