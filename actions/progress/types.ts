export interface CourseProgressResult {
  completedLessons: number;
  totalLessons: number;
  percentage: number;
}

export interface CourseCompletionSummary {
  courseId: string;
  courseTitle: string;
  completedLessons: number;
  totalLessons: number;
  percentage: number;
}
