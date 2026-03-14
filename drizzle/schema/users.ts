import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { roleEnum, statusEnum } from "./enums";
import { schools } from "./schools";
import { courses } from "./courses";
import { purchases, userProgress, courseLikes, reviews } from "./interactions";
import { pointTransactions, dailyWatchTime } from "./gamification";
import { userNotes, questions, answers } from "./qa";
import { assignmentSubmissions } from "./assessments";
import { courseRequests } from "./requests";
import { certificates } from "./certificates";
import { userSkills, userAssessmentResults } from "./skills";

export const users = pgTable(
  "user",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    clerkId: text("clerk_id").unique().notNull(),

    // [NEW] SYSTEM LEVEL
    isSuperAdmin: boolean("is_super_admin").default(false).notNull(),

    // [NEW] TENANT LEVEL
    schoolId: uuid("school_id").references(() => schools.id, {
      onDelete: "cascade",
    }), // Nullable! Super-Admins might not have a school

    email: text("email").notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    bio: text("bio"),
    expertise: text("expertise"),

    // Defaults to LEARNER (B2C)
    // Updated to TEACHER or STUDENT during B2B onboarding
    role: roleEnum("role").default("LEARNER").notNull(),
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

    // Diagnostic assessment
    diagnosticCompletedAt: timestamp("diagnostic_completed_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("user_email_idx").on(table.email),

    index("user_role_status_idx").on(table.role, table.status),

    index("user_paystack_idx").on(table.paystackCustomerCode),
  ],
);

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
  assignmentSubmissions: many(assignmentSubmissions),
  courseRequests: many(courseRequests),
  certificates: many(certificates),
  userSkills: many(userSkills),
  userAssessmentResults: many(userAssessmentResults),
}));
