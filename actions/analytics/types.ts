export interface MonthlyDataPoint {
  month: string;
  value: number;
}

export interface CoursePerformance {
  id: string;
  title: string;
  imageUrl: string | null;
  price: number;
  totalEnrollments: number;
  totalRevenue: number;
  totalLessons: number;
  completionRate: number;
  avgQuizScore: number | null;
}

export interface RecentEnrollment {
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  enrolledAt: Date;
  amount: number;
}

export interface QuizPerformance {
  lessonId: string;
  lessonTitle: string;
  courseTitle: string;
  avgScore: number;
  passRate: number;
  totalAttempts: number;
}

export interface TutorAnalytics {
  totalRevenue: number;
  totalStudents: number;
  publishedCourses: number;
  totalCourses: number;
  avgQuizScore: number | null;
  revenueByMonth: MonthlyDataPoint[];
  enrollmentsByMonth: MonthlyDataPoint[];
  courses: CoursePerformance[];
  recentEnrollments: RecentEnrollment[];
  quizPerformance: QuizPerformance[];
}

/* ── Admin Analytics ── */

export interface UserGrowthPoint {
  month: string;
  learners: number;
  tutors: number;
}

export interface FailedPaymentRow {
  month: string;
  count: number;
  totalAmount: number;
}

export interface PlatformEngagement {
  totalWatchMinutes: number;
  totalQuizAttempts: number;
  totalPointsEarned: number;
  activeLearnersLast30d: number;
}

export interface AdminAnalytics {
  revenueByMonth: MonthlyDataPoint[];
  enrollmentsByMonth: MonthlyDataPoint[];
  userGrowth: UserGrowthPoint[];
  topCourses: CoursePerformance[];
  failedPayments: FailedPaymentRow[];
  failedPaymentsTotalCount: number;
  failedPaymentsTotalAmount: number;
  engagement: PlatformEngagement;
}
