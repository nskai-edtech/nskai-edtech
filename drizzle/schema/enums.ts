import { pgEnum } from "drizzle-orm/pg-core";

// 1. ROLES
// ADMIN = Zerra Platform Admin
// TUTOR = Zerra Content Creator (B2C)
// LEARNER = Zerra Direct Student (B2C)
// SCHOOL_ADMIN = The "Organization" Administrator (B2B)
// TEACHER = School Staff / Class Manager (B2B)
// STUDENT = School Learner (B2B)
export const roleEnum = pgEnum("role", [
  "ADMIN",
  "TUTOR",
  "LEARNER",
  "SCHOOL_ADMIN",
  "TEACHER",
  "STUDENT",
]);
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
