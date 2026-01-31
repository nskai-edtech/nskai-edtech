import { getMarketplaceCourses } from "@/actions/courses";
import { CourseCard } from "@/components/courses/course-card";
import { DebouncedSearch } from "@/components/debounced-search";

export default async function CourseMarketplace({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search;
  const page = params.page ? parseInt(params.page) : 1;

  const { courses } = await getMarketplaceCourses(page, 12, search);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Course Marketplace</h1>
          <p className="text-secondary-text mt-2">
            Browse our collection of courses across different categories
          </p>
        </div>
        <DebouncedSearch
          basePath="/learner/marketplace"
          placeholder="Search courses..."
        />
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-3xl bg-surface/50 border-border">
          <p className="text-lg font-medium text-secondary-text">
            No courses found
          </p>
          <p className="text-sm text-secondary-text/70">
            Try adjusting your search filters
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              href={`/learner/marketplace/${course.id}`}
            />
          ))}
        </div>
      )}
    </>
  );
}
