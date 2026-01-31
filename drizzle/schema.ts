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
export const statusEnum = pgEnum("status", [
  "PENDING",
  "ACTIVE",
  "REJECTED",
  "SUSPENDED",
  "BANNED",
]);

export const courseStatusEnum = pgEnum("course_status", [
  "DRAFT",
  "PENDING",
  "PUBLISHED",
  "REJECTED",
]);

// 2. USERS
export const users = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").unique().notNull(),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  bio: text("bio"), // The description of the tutor
  expertise: text("expertise"), // e.g., "Frontend Dev", "Data Science"

  // Default is LEARNER. The frontend can send 'TUTOR' if selected.
  // 'ADMIN' can NEVER be set via the public API.
  role: roleEnum("role").default("LEARNER").notNull(),

  // Default to ACTIVE (so learners don't get stuck)
  // Tutors will be manually set to PENDING in the onboarding action.
  status: statusEnum("status").default("PENDING").notNull(),

  imageUrl: text("image_url"),

  // Paystack: Only needed if they buy something
  paystackCustomerCode: text("paystack_customer_code"),

  // Interests for learners
  interests: text("interests").array(),
  learningGoal: text("learning_goal"),

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
  status: courseStatusEnum("status").default("DRAFT").notNull(),
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

// 10. SKILLS (Graph Nodes)
export const skills = pgTable("skill", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(), // e.g., "Frontend", "Backend"
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 11. SKILL DEPENDENCIES (Edges)
export const skillDependencies = pgTable("skill_dependency", {
  id: uuid("id").defaultRandom().primaryKey(),
  skillId: uuid("skill_id")
    .references(() => skills.id, { onDelete: "cascade" })
    .notNull(),
  prerequisiteSkillId: uuid("prerequisite_skill_id")
    .references(() => skills.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 12. USER SKILLS (Mastery)
export const userSkills = pgTable("user_skill", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  skillId: uuid("skill_id")
    .references(() => skills.id, { onDelete: "cascade" })
    .notNull(),
  masteryScore: integer("mastery_score").default(0).notNull(), // 0-100
  lastAssessedAt: timestamp("last_assessed_at").defaultNow(),
});

// 13. ASSESSMENTS (Diagnostic)
export const assessments = pgTable("assessment", {
  id: uuid("id").defaultRandom().primaryKey(),
  skillId: uuid("skill_id")
    .references(() => skills.id, { onDelete: "cascade" })
    .notNull(),
  questionText: text("question_text").notNull(),
  options: text("options").array().notNull(), // Postgres Array
  correctOption: integer("correct_option").notNull(), // Index
  difficulty: text("difficulty").default("BEGINNER"), // BEGINNER, INTERMEDIATE, ADVANCED
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 14. USER ASSESSMENT RESULTS
export const userAssessmentResults = pgTable("user_assessment_result", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  assessmentId: uuid("assessment_id")
    .references(() => assessments.id, { onDelete: "cascade" })
    .notNull(),
  isCorrect: boolean("is_correct").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// RELATIONS (New Tables)

export const skillRelations = relations(skills, ({ many }) => ({
  dependencies: many(skillDependencies, { relationName: "skillPrerequisites" }),
  prerequisites: many(skillDependencies, { relationName: "skillDependents" }),
  userSkills: many(userSkills),
  assessments: many(assessments),
}));

export const skillDependencyRelations = relations(
  skillDependencies,
  ({ one }) => ({
    skill: one(skills, {
      fields: [skillDependencies.skillId],
      references: [skills.id],
      relationName: "skillPrerequisites",
    }),
    prerequisite: one(skills, {
      fields: [skillDependencies.prerequisiteSkillId],
      references: [skills.id],
      relationName: "skillDependents",
    }),
  }),
);

export const userSkillRelations = relations(userSkills, ({ one }) => ({
  user: one(users, {
    fields: [userSkills.userId],
    references: [users.id],
  }),
  skill: one(skills, {
    fields: [userSkills.skillId],
    references: [skills.id],
  }),
}));

export const assessmentRelations = relations(assessments, ({ one, many }) => ({
  skill: one(skills, {
    fields: [assessments.skillId],
    references: [skills.id],
  }),
  results: many(userAssessmentResults),
}));

export const userAssessmentResultRelations = relations(
  userAssessmentResults,
  ({ one }) => ({
    user: one(users, {
      fields: [userAssessmentResults.userId],
      references: [users.id],
    }),
    assessment: one(assessments, {
      fields: [userAssessmentResults.assessmentId],
      references: [assessments.id],
    }),
  }),
);
