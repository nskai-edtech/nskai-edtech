export interface CourseReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date | null;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
}

export interface CourseRatingStats {
  avgRating: number;
  totalReviews: number;
  totalLikes: number;
}
