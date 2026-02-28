export interface RecommendedCourse {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  status: "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED";
  imageUrl: string | null;
  tags: string[] | null;
  createdAt: Date;
  matchScore: number;
  enrollmentCount: number;
  averageRating: number | null;
  tutor: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  } | null;
}

export type RecommendationTier =
  | "interest-match"
  | "popular"
  | "highly-rated"
  | "fallback";
