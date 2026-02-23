export interface PathCourseMapping {
  courseId: string;
  position: number;
  mappingId: string;
  title: string;
  status: "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED";
  imageUrl: string | null;
  price: number | null;
  tutorFirstName: string | null;
  tutorLastName: string | null;
}

export interface LearningPathDetails {
  id: string;
  title: string;
  description: string | null;
  isPublished: boolean;
  attachedCourses: PathCourseMapping[];
  totalPrice: number;
}
