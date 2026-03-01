export type PointReason =
  | "LESSON_COMPLETED"
  | "QUIZ_PASSED"
  | "MODULE_COMPLETED"
  | "MODULE_QUIZZES_PASSED"
  | "STREAK_7_DAYS"
  | "DIAGNOSTIC_COMPLETED"
  | "SKILL_MASTERED";

export interface LeaderboardUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  points: number;
  currentStreak: number;
}
