export interface CourseWithTutor {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  status: "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED";
  imageUrl: string | null;
  createdAt: Date;
  tutor: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  } | null;
}

export interface PaginatedCoursesResult {
  courses: CourseWithTutor[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
