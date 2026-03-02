"use client";

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
  Loader2,
} from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { getTutorCourses } from "@/actions/courses/tutor";
import type {
  CourseWithTutor,
  PaginatedCoursesResult,
} from "@/actions/courses/types";

type FilterKey = "total" | "published" | "draft" | "paid";

const PAGE_SIZE = 12;

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  PUBLISHED: {
    label: "Published",
    className:
      "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400",
  },
  PENDING: {
    label: "Pending Review",
    className:
      "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400",
  },
  DRAFT: {
    label: "Draft",
    className: "bg-surface-muted border border-border text-secondary-text",
  },
};

function formatPrice(priceInKobo: number | null | undefined): string {
  if (!priceInKobo) return "Free";
  return `₦${(priceInKobo / 100).toLocaleString()}`;
}

interface StatCardProps {
  label: string;
  count: number;
  icon: React.ReactNode;
  filterKey: FilterKey;
  selectedFilter: FilterKey;
  accentBg: string;
  borderColor: string;
  onClick: (key: FilterKey) => void;
}

function StatCard({
  label,
  count,
  icon,
  filterKey,
  selectedFilter,
  accentBg,
  borderColor,
  onClick,
}: StatCardProps) {
  const isSelected = selectedFilter === filterKey;
  return (
    <button
      onClick={() => onClick(filterKey)}
      className={`w-full text-left bg-surface rounded-xl p-4 transition-all border-2 ${
        isSelected
          ? `${accentBg} ${borderColor} shadow-md`
          : "border-border hover:bg-surface-muted hover:shadow-sm"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            isSelected ? accentBg : "bg-surface-muted"
          }`}
        >
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-primary-text">{count}</p>
          <p className="text-sm font-medium text-secondary-text">{label}</p>
        </div>
      </div>
    </button>
  );
}

export default function TutorCoursesPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>("total");
  const [currentPage, setCurrentPage] = useState(1);

  // Server data state
  const [courses, setCourses] = useState<CourseWithTutor[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [loading, setLoading] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch courses from server
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const result: PaginatedCoursesResult = await getTutorCourses(
        currentPage,
        PAGE_SIZE,
        debouncedSearch,
      );
      setCourses(result.courses);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
      setHasNextPage(result.hasNextPage);
      setHasPreviousPage(result.hasPreviousPage);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Stat card configs
  const CARD_CONFIG = useMemo(
    () => [
      {
        key: "total" as FilterKey,
        label: "Total Courses",
        accentBg: "bg-red-500/50",
        borderColor: "border-red-500",
        icon: <BookOpen className="w-5 h-5 text-red-500" />,
        count: courses.length,
        filter: (c: CourseWithTutor[]) => c,
      },
      {
        key: "published" as FilterKey,
        label: "Published",
        accentBg: "bg-green-500/50",
        borderColor: "border-green-500",
        icon: <Eye className="w-5 h-5 text-green-500" />,
        count: courses.filter((c) => c.status === "PUBLISHED").length,
        filter: (c: CourseWithTutor[]) =>
          c.filter((course) => course.status === "PUBLISHED"),
      },
      {
        key: "draft" as FilterKey,
        label: "Drafts",
        accentBg: "bg-amber-500/50",
        borderColor: "border-amber-500",
        icon: <EyeOff className="w-5 h-5 text-amber-500" />,
        count: courses.filter((c) => c.status === "DRAFT").length,
        filter: (c: CourseWithTutor[]) =>
          c.filter((course) => course.status === "DRAFT"),
      },
      {
        key: "paid" as FilterKey,
        label: "Paid Courses",
        accentBg: "bg-purple-500/50",
        borderColor: "border-purple-500",
        icon: <DollarSign className="w-5 h-5 text-purple-500" />,
        count: courses.filter((c) => c.price && c.price > 0).length,
        filter: (c: CourseWithTutor[]) =>
          c.filter((course) => course.price && course.price > 0),
      },
    ],
    [courses],
  );

  // Apply card filter then search filter
  const filteredCourses = useMemo(() => {
    const config = CARD_CONFIG.find((c) => c.key === selectedFilter);
    const cardFiltered = config ? config.filter(courses) : courses;
    if (!debouncedSearch.trim()) return cardFiltered;
    const q = debouncedSearch.trim().toLowerCase();
    return cardFiltered.filter(
      (course) =>
        course.title.toLowerCase().includes(q) ||
        (course.description ?? "").toLowerCase().includes(q),
    );
  }, [selectedFilter, courses, debouncedSearch, CARD_CONFIG]);

  const handleFilterClick = (key: FilterKey) => {
    setSelectedFilter(key);
    setCurrentPage(1);
  };

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
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
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-lg font-medium transition-colors w-fit"
        >
          <Plus className="w-5 h-5" />
          Create Course
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-text pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand/50 transition-shadow"
          />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {CARD_CONFIG.map((card) => (
          <StatCard
            key={card.key}
            label={card.label}
            count={card.count}
            icon={card.icon}
            filterKey={card.key}
            selectedFilter={selectedFilter}
            accentBg={card.accentBg}
            borderColor={card.borderColor}
            onClick={handleFilterClick}
          />
        ))}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => {
            const badge = STATUS_BADGE[course.status] ?? STATUS_BADGE.DRAFT;
            return (
              <Link
                key={course.id}
                href={`/tutor/courses/${course.id}`}
                className="group bg-surface border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all hover:border-brand/50"
              >
                {/* Thumbnail */}
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
                      <BookOpen className="w-12 h-12 text-secondary-text/40" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-primary-text mb-1 line-clamp-1 group-hover:text-brand transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-secondary-text mb-4 line-clamp-2">
                    {course.description || "No description yet"}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-brand">
                      {formatPrice(
                        typeof course.price === "number" ? course.price : null,
                      )}
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
            );
          })}
        </div>
      ) : (
        // Empty state
        <div className="text-center py-16 bg-surface-muted/30 rounded-xl border border-dashed border-border">
          <BookOpen className="w-16 h-16 text-secondary-text/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-primary-text mb-2">
            {debouncedSearch ? "No courses found" : "No courses yet"}
          </h3>
          <p className="text-secondary-text mb-6 max-w-sm mx-auto text-sm">
            {debouncedSearch
              ? `No courses matching "${debouncedSearch}". Try a different search.`
              : "Create your first course and start teaching students worldwide."}
          </p>
          {!debouncedSearch && (
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
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <p className="text-sm text-secondary-text">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–
            {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount}{" "}
            courses
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={!hasPreviousPage}
              className="p-2 rounded-lg border border-border hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

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
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      pageNum === currentPage
                        ? "bg-brand text-white"
                        : "border border-border hover:bg-surface-muted"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={!hasNextPage}
              className="p-2 rounded-lg border border-border hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
