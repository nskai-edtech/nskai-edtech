import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
  uniqueIndex,
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

export const lessonTypeEnum = pgEnum("lesson_type", ["VIDEO", "QUIZ"]);

export const pointReasonEnum = pgEnum("point_reason", [
  "MODULE_COMPLETED",
  "MODULE_QUIZZES_PASSED",
  "STREAK_7_DAYS",
]);

// 2. USERS
export const users = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").unique().notNull(),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  bio: text("bio"),
  expertise: text("expertise"),

  // Default is LEARNER. The frontend can send 'TUTOR' if selected.
  // 'ADMIN' can NEVER be set via the public API.
  role: roleEnum("role").default("LEARNER").notNull(),

  // Default to ACTIVE (so learners don't get stuck)
  // Tutors will be manually set to PENDING in the onboarding action.
  status: statusEnum("status").default("PENDING").notNull(),

  imageUrl: text("image_url"),

  // Paystack
  paystackCustomerCode: text("paystack_customer_code"),

  // Interests for learners
  interests: text("interests").array(),
  learningGoal: text("learning_goal"),

  // Gamification (Points & Streaks)
  points: integer("points").default(0).notNull(),
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  streakLastActiveDate: timestamp("streak_last_active_date"),

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

// 3a. LEARNING PATHS (Bundles)
export const learningPaths = pgTable("learning_path", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  price: integer("price"),
  isPublished: boolean("is_published").default(false),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3b. LEARNING PATH COURSES (Join Table)
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

// 3c. USER ENROLLED LEARNING PATHS
export const userLearningPaths = pgTable("user_learning_path", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  learningPathId: uuid("learning_path_id")
    .references(() => learningPaths.id, { onDelete: "cascade" })
    .notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
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
  notes: text("notes"), // For rich text content (HTML)
  type: lessonTypeEnum("type").default("VIDEO").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 5b. QUIZ QUESTIONS (linked to a lesson of type QUIZ)
export const quizQuestions = pgTable("quiz_question", {
  id: uuid("id").defaultRandom().primaryKey(),
  lessonId: uuid("lesson_id")
    .references(() => lessons.id, { onDelete: "cascade" })
    .notNull(),
  questionText: text("question_text").notNull(),
  options: text("options").array().notNull(),
  correctOption: integer("correct_option").notNull(),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 5c. USER QUIZ ATTEMPTS
export const userQuizAttempts = pgTable("user_quiz_attempt", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  lessonId: uuid("lesson_id")
    .references(() => lessons.id, { onDelete: "cascade" })
    .notNull(),
  score: integer("score").notNull(), // 0-100 percentage
  passed: boolean("passed").notNull().default(false),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
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

// 7b. REVIEWS
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

// 7c. COURSE LIKES
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

// 8. PROGRESS
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

// 8b. GAMIFICATION TRANSACTIONS
export const pointTransactions = pgTable(
  "point_transaction",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    amount: integer("amount").notNull(),
    reason: pointReasonEnum("reason").notNull(),
    referenceId: text("reference_id"), // e.g. chapterId or date string
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  // Ensure we don't accidentally double-award for the exact same reason/reference
  (t) => [
    uniqueIndex("point_tx_user_reason_ref_idx").on(
      t.userId,
      t.reason,
      t.referenceId,
    ),
  ],
);

// 8c. DAILY WATCH TIME
export const dailyWatchTime = pgTable(
  "daily_watch_time",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    date: text("date").notNull(), // Format: YYYY-MM-DD
    minutesWatched: integer("minutes_watched").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("daily_watch_time_user_date_idx").on(t.userId, t.date)],
);

// 9. RELATIONS (For Drizzle Querying)

export const userRelations = relations(users, ({ many }) => ({
  coursesTeaching: many(courses),
  purchases: many(purchases),
  progress: many(userProgress),
  userNotes: many(userNotes),
  questions: many(questions),
  answers: many(answers),
  reviews: many(reviews),
  courseLikes: many(courseLikes),
  pointTransactions: many(pointTransactions),
  dailyWatchTimes: many(dailyWatchTime),
}));

export const courseRelations = relations(courses, ({ one, many }) => ({
  tutor: one(users, {
    fields: [courses.tutorId],
    references: [users.id],
  }),
  chapters: many(chapters),
  purchases: many(purchases),
  reviews: many(reviews),
  courseLikes: many(courseLikes),
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

export const pointTransactionRelations = relations(
  pointTransactions,
  ({ one }) => ({
    user: one(users, {
      fields: [pointTransactions.userId],
      references: [users.id],
    }),
  }),
);

export const dailyWatchTimeRelations = relations(dailyWatchTime, ({ one }) => ({
  user: one(users, {
    fields: [dailyWatchTime.userId],
    references: [users.id],
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

// RELATIONS

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

// 15. NOTES (User Private Notes)
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
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("user_notes_user_lesson_idx").on(t.userId, t.lessonId)],
);

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

// 16. Q&A QUESTIONS
export const questions = pgTable("question", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  lessonId: uuid("lesson_id")
    .references(() => lessons.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 17. Q&A ANSWERS
export const answers = pgTable("answer", {
  id: uuid("id").defaultRandom().primaryKey(),
  questionId: uuid("question_id")
    .references(() => questions.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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
