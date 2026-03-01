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
  "ARCHIVED",
]);

export const lessonTypeEnum = pgEnum("lesson_type", ["VIDEO", "QUIZ"]);

export const assignmentSubmissionStatusEnum = pgEnum(
  "assignment_submission_status",
  ["PENDING", "GRADED", "REJECTED"],
);

export const pointReasonEnum = pgEnum("point_reason", [
  "LESSON_COMPLETED",
  "QUIZ_PASSED",
  "MODULE_COMPLETED",
  "MODULE_QUIZZES_PASSED",
  "STREAK_7_DAYS",
  "DIAGNOSTIC_COMPLETED",
  "SKILL_MASTERED",
]);

export const requestTypeEnum = pgEnum("request_type", ["DRAFT", "DELETE"]);
export const requestStatusEnum = pgEnum("request_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);
