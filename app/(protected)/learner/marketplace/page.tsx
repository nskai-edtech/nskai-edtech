import { getMarketplaceCourses } from "@/actions/courses";
import { getPublishedLearningPaths } from "@/actions/learning-paths";
import { CourseCard } from "@/components/courses/course-card";
import { Layers, BookOpen } from "lucide-react";
import Link from "next/link";
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
  const learningPaths = await getPublishedLearningPaths();

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

      {/* Learning Paths Section */}
      {learningPaths.length > 0 && !search && (
        <div className="mb-12">
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

      {/* Individual Courses Section */}
      <h2 className="text-xl font-bold text-primary-text mb-6">All Courses</h2>
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
              href={`/learner/${course.id}`}
            />
          ))}
        </div>
      )}
    </>
  );
}
