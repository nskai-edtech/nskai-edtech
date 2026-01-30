export interface CourseResponse {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  price: number | null;
  tutor: {
    firstName: string | null;
    lastName: string | null;
  } | null;
}

export interface ChapterResponse {
  id: string;
  title: string;
  position: number;
}

export interface LessonResponse {
  id: string;
  title: string;
  position: number;
  isFreePreview: boolean;
  videoUrl?: string | null;
  description?: string | null;
}

export interface CourseDetailResponse extends CourseResponse {
  chapters: (ChapterResponse & { lessons: LessonResponse[] })[];
}
