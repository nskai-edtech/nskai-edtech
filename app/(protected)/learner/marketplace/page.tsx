import { CourseCard } from "@/components/courses/course-card";
import { Layers, BookOpen, SearchX, Sparkles } from "lucide-react";
import Link from "next/link";
import { MarketplaceFilters } from "@/components/courses/marketplace-filters";
import {
  getMarketplaceCourses,
  getUserInterests,
} from "@/actions/courses/marketplace";
import { getPublishedLearningPaths } from "@/actions/learning-paths/actions";
import { fetchCoursesByInterests } from "@/actions/recommendations/queries";
import type { PriceFilter, SortOption } from "@/actions/courses/types";

export default async function CourseMarketplace({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    page?: string;
    tag?: string;
    sort?: string;
    price?: string;
    tab?: string;
  }>;
}) {
  const params = await searchParams;
  const search = params.search;
  const page = params.page ? parseInt(params.page) : 1;
  const tag = params.tag;
  const sortBy = (params.sort as SortOption) || "newest";
  const priceFilter = (params.price as PriceFilter) || "all";
  const tab = params.tab || "all";

  // Fetch user interests in parallel with other data
  const [{ interests: userInterests, userId }, learningPaths] =
    await Promise.all([getUserInterests(), getPublishedLearningPaths()]);

  // Determine which tags to filter by based on active tab
  let activeTags: string[] | undefined;
  if (tag) {
    activeTags = [tag];
  } else if (tab === "for-you") {
    activeTags = userInterests.length > 0 ? userInterests : undefined;
  } else if (tab !== "all") {
    // Tab is a specific topic ID
    activeTags = [tab];
  }

  // Fetch courses based on filters
  let courses;
  let totalCount: number;

  if (tab === "for-you" && userId && userInterests.length > 0 && !search) {
    // Use the recommendation engine for "For You" tab
    const recommended = await fetchCoursesByInterests(
      userInterests,
      userId,
      50,
    );
    // Apply client-side price filter for "for-you" since it uses a different query
    let filtered = recommended;
    if (priceFilter === "free") {
      filtered = filtered.filter((c) => !c.price || c.price === 0);
    } else if (priceFilter === "paid") {
      filtered = filtered.filter((c) => c.price && c.price > 0);
    }
    courses = filtered;
    totalCount = filtered.length;
  } else {
    const result = await getMarketplaceCourses(page, 12, search, {
      tags: activeTags,
      priceFilter,
      sortBy,
    });
    courses = result.courses;
    totalCount = result.totalCount;
  }

  const hasFilters =
    !!search ||
    !!tag ||
    sortBy !== "newest" ||
    priceFilter !== "all" ||
    tab !== "all";

  return (
    <>
      {/* ── Filters Section ── */}
      <MarketplaceFilters
        userInterests={userInterests}
        totalCount={totalCount}
      />

      {/* ── Learning Paths Section ── */}
      {learningPaths.length > 0 && !hasFilters && (
        <div className="mt-8 mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Layers className="w-6 h-6 text-brand" />
            <h2 className="text-2xl font-bold text-primary-text">
              Curated Learning Paths
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {learningPaths.map((path) => (
              <Link
                key={path.id}
                href={`/learner/paths/${path.id}`}
                className="bg-surface border border-border rounded-3xl p-6 hover:shadow-md hover:border-brand/30 transition-all group block"
              >
                <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-brand mb-4">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-primary-text mb-2 group-hover:text-brand transition-colors line-clamp-1">
                  {path.title}
                </h3>
                <p className="text-sm text-secondary-text line-clamp-2 mb-6 h-10">
                  {path.description || "Comprehensive learning track."}
                </p>

                <div className="flex items-center justify-between text-xs font-bold pt-4 border-t border-border">
                  <div className="flex items-center gap-1.5 text-secondary-text">
                    <BookOpen className="w-4 h-4" />
                    {path.courseCount} Courses
                  </div>
                  <span className="text-brand flex items-center gap-1">
                    View Track &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Courses Grid ── */}
      <div className="mt-6">
        {tab === "for-you" && (
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-brand" />
            <h2 className="text-lg font-bold text-primary-text">
              Recommended for You
            </h2>
          </div>
        )}

        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 border border-dashed rounded-3xl bg-surface/50 border-border">
            <div className="w-16 h-16 bg-surface-muted rounded-2xl flex items-center justify-center mb-4">
              <SearchX className="w-8 h-8 text-secondary-text/40" />
            </div>
            {tab === "for-you" ? (
              <>
                <p className="text-lg font-medium text-primary-text mb-1">
                  No recommendations yet
                </p>
                <p className="text-sm text-secondary-text text-center max-w-md">
                  We&apos;re still learning your preferences. Browse{" "}
                  <Link
                    href="/learner/marketplace"
                    className="text-brand font-medium hover:underline"
                  >
                    All courses
                  </Link>{" "}
                  to discover something new.
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium text-primary-text mb-1">
                  No courses found
                </p>
                <p className="text-sm text-secondary-text text-center max-w-md mb-4">
                  {hasFilters
                    ? "Try removing some filters or searching for something else."
                    : "Check back later for new courses."}
                </p>
                {hasFilters && (
                  <Link
                    href="/learner/marketplace"
                    className="px-4 py-2 text-sm font-medium text-brand border border-brand/30 rounded-xl hover:bg-brand/5 transition-colors"
                  >
                    Clear all filters
                  </Link>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                href={`/learner/${course.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
