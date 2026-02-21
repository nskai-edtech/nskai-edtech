import { pgEnum } from "drizzle-orm/pg-core";

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
