import { getTutorCourses } from "@/actions/courses";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Eye,
  EyeOff,
} from "lucide-react";

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function TutorCoursesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const search = params.search || "";

  const {
    courses,
    totalCount,
    totalPages,
    currentPage,
    hasNextPage,
    hasPreviousPage,
  } = await getTutorCourses(page, 20, search || undefined);

  // Format price from Kobo to Naira
  const formatPrice = (priceInKobo: number | null) => {
    if (!priceInKobo) return "Free";
    return `₦${(priceInKobo / 100).toLocaleString()}`;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary-text">My Courses</h1>
          <p className="text-secondary-text mt-1">
            Manage your courses and track student enrollments
          </p>
        </div>
        <Link
          href="/tutor/courses/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Course
        </Link>
      </div>

      {/* Search Bar */}
      <form className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-text" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search courses..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand/50"
          />
        </div>
      </form>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-brand" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-text">
                {totalCount}
              </p>
              <p className="text-sm text-secondary-text">Total Courses</p>
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-text">
                {courses.filter((c) => c.isPublished).length}
              </p>
              <p className="text-sm text-secondary-text">Published</p>
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <EyeOff className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-text">
                {courses.filter((c) => !c.isPublished).length}
              </p>
              <p className="text-sm text-secondary-text">Draft</p>
            </div>
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-text">
                {courses.filter((c) => c.price && c.price > 0).length}
              </p>
              <p className="text-sm text-secondary-text">Paid Courses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/tutor/courses/${course.id}`}
              className="group bg-surface border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all hover:border-brand/50"
            >
              {/* Course Image */}
              <div className="relative h-40 bg-surface-muted">
                {course.imageUrl ? (
                  <Image
                    src={course.imageUrl}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-secondary-text/50" />
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  {course.isPublished ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400">
                      Published
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400">
                      Draft
                    </span>
                  )}
                </div>
              </div>

              {/* Course Info */}
              <div className="p-4">
                <h3 className="font-bold text-primary-text mb-2 line-clamp-1 group-hover:text-brand transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-secondary-text mb-4 line-clamp-2">
                  {course.description || "No description yet"}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-brand">
                    {formatPrice(course.price)}
                  </span>
                  <div className="flex items-center gap-1 text-secondary-text text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {new Date(course.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-surface-muted/30 rounded-xl border border-border">
          <BookOpen className="w-16 h-16 text-secondary-text mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-primary-text mb-2">
            {search ? "No courses found" : "No courses yet"}
          </h3>
          <p className="text-secondary-text mb-6 max-w-sm mx-auto">
            {search
              ? `No courses matching "${search}". Try a different search.`
              : "Create your first course and start teaching students worldwide."}
          </p>
          {!search && (
            <Link
              href="/tutor/courses/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Course
            </Link>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <p className="text-sm text-secondary-text">
            Showing {(currentPage - 1) * 20 + 1} -{" "}
            {Math.min(currentPage * 20, totalCount)} of {totalCount} courses
          </p>
          <div className="flex items-center gap-2">
            {hasPreviousPage ? (
              <Link
                href={`/tutor/courses?page=${currentPage - 1}${search ? `&search=${search}` : ""}`}
                className="p-2 rounded-lg border border-border hover:bg-surface-muted transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
            ) : (
              <button
                disabled
                className="p-2 rounded-lg border border-border opacity-50 cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Link
                    key={pageNum}
                    href={`/tutor/courses?page=${pageNum}${search ? `&search=${search}` : ""}`}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      pageNum === currentPage
                        ? "bg-brand text-white"
                        : "border border-border hover:bg-surface-muted"
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              })}
            </div>

            {hasNextPage ? (
              <Link
                href={`/tutor/courses?page=${currentPage + 1}${search ? `&search=${search}` : ""}`}
                className="p-2 rounded-lg border border-border hover:bg-surface-muted transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </Link>
            ) : (
              <button
                disabled
                className="p-2 rounded-lg border border-border opacity-50 cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
