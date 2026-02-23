export interface LearnerProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  bio: string | null;
  expertise: string | null;
  interests: string[] | null;
  imageUrl: string | null;
  createdAt: Date | null;
}

export interface LearnerStats {
  totalCoursesEnrolled: number;
  totalCoursesCompleted: number;
  totalLessonsCompleted: number;
  completionRate: number;
  memberSince: Date | null;
  lastActivityDate: Date | null;
  points: number;
  currentStreak: number;
  longestStreak: number;
}
