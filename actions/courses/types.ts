export interface CourseWithTutor {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  status: "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED" | "ARCHIVED";
  imageUrl: string | null;
  tags?: string[] | null;
  createdAt: Date;
  tutor: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  } | null;
}

export type SortOption =
  | "newest"
  | "popular"
  | "rating"
  | "price-asc"
  | "price-desc";
export type PriceFilter = "all" | "free" | "paid";

export interface MarketplaceFilters {
  search?: string;
  tags?: string[];
  priceFilter?: PriceFilter;
  sortBy?: SortOption;
  tab?: string;
  page?: number;
}

export interface PaginatedCoursesResult {
  courses: CourseWithTutor[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
