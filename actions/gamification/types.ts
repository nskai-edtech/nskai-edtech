export type PointReason =
  | "MODULE_COMPLETED"
  | "MODULE_QUIZZES_PASSED"
  | "STREAK_7_DAYS";

export interface LeaderboardUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  points: number;
  currentStreak: number;
}
