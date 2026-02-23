export interface CompletedCourse {
  courseId: string;
  courseTitle: string;
  courseImageUrl: string | null;
  tutorName: string;
  completionDate: Date;
  totalLessons: number;
}

export interface CertificateData {
  courseTitle: string;
  courseImageUrl: string | null;
  learnerName: string;
  tutorName: string;
  completionDate: Date;
  courseId: string;
}
