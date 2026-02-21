import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { roleEnum, statusEnum } from "./enums";
import { courses } from "./courses";
import { purchases, userProgress, courseLikes, reviews } from "./interactions";
import { pointTransactions, dailyWatchTime } from "./gamification";
import { userNotes, questions, answers } from "./qa";

export const users = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").unique().notNull(),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  bio: text("bio"),
  expertise: text("expertise"),

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

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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
