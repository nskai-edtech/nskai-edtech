export interface RecommendedCourse {
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
