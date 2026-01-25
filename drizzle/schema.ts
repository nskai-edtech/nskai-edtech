import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. ROLES
// ADMIN = The "Organization" (NSKAI)
// TUTOR = Content Creator
// LEARNER = Student
export const roleEnum = pgEnum("role", ["ADMIN", "TUTOR", "LEARNER"]);

// 2. USERS
export const users = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").unique().notNull(),
  email: text("email").notNull(),

  // Default is LEARNER. The frontend can send 'TUTOR' if selected.
  // 'ADMIN' can NEVER be set via the public API.
  role: roleEnum("role").default("LEARNER").notNull(),

  imageUrl: text("image_url"),

  // Paystack: Only needed if they buy something
  paystackCustomerCode: text("paystack_customer_code"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. COURSES
export const courses = pgTable("course", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),

  // The Tutor managing the course.
  // If the Tutor leaves, the course stays (onDelete: set null).
  // The Admin (Organization) always retains ownership.
  tutorId: uuid("tutor_id").references(() => users.id, {
    onDelete: "set null",
  }),

  price: integer("price"), // Price in Kobo
  isPublished: boolean("is_published").default(false),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. MODULES (Chapters)
export const chapters = pgTable("chapter", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id").references(() => courses.id, {
    onDelete: "cascade",
  }),
  title: text("title").notNull(),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 5. LESSONS
export const lessons = pgTable("lesson", {
  id: uuid("id").defaultRandom().primaryKey(),
  chapterId: uuid("chapter_id").references(() => chapters.id, {
    onDelete: "cascade",
  }),
  title: text("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url"),
  position: integer("position").notNull(),
  isFreePreview: boolean("is_free_preview").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 6. MUX DATA (Video Hosting)
export const muxData = pgTable("mux_data", {
  id: uuid("id").defaultRandom().primaryKey(),
  lessonId: uuid("lesson_id")
    .references(() => lessons.id, { onDelete: "cascade" })
    .unique(),
  assetId: text("asset_id").notNull(),
  playbackId: text("playback_id"),
});

// 7. PURCHASES (Access Control)
export const purchases = pgTable("purchase", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }), // The Student
  courseId: uuid("course_id").references(() => courses.id, {
    onDelete: "cascade",
  }), // The Course

  // Paystack Verification
  paystackReference: text("paystack_reference").unique().notNull(),
  amount: integer("amount").notNull(),
  status: text("status").default("success"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 8. PROGRESS
export const userProgress = pgTable("user_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  lessonId: uuid("lesson_id").references(() => lessons.id, {
    onDelete: "cascade",
  }),
  isCompleted: boolean("is_completed").default(false),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
});

// 9. RELATIONS (For Drizzle Querying)

export const userRelations = relations(users, ({ many }) => ({
  coursesTeaching: many(courses),
  purchases: many(purchases),
  progress: many(userProgress),
}));

export const courseRelations = relations(courses, ({ one, many }) => ({
  tutor: one(users, {
    fields: [courses.tutorId],
    references: [users.id],
  }),
  chapters: many(chapters),
  purchases: many(purchases),
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
}));

export const muxDataRelations = relations(muxData, ({ one }) => ({
  lesson: one(lessons, {
    fields: [muxData.lessonId],
    references: [lessons.id],
  }),
}));

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
