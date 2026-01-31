import { getEnrolledCourses } from "@/actions/courses";
import { CourseCard } from "@/components/courses/course-card";

export default async function EnrolledCourses() {
  const courses = await getEnrolledCourses();

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Enrolled Courses</h1>
        <p className="text-secondary-text mt-2">
          Continue learning from where you left off
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-3xl bg-surface/50 border-border">
          <p className="text-lg font-medium text-secondary-text tracking-tight">
            You are not enrolled in any courses yet.
          </p>
          <p className="text-sm text-secondary-text/70 mt-1">
            Browse the marketplace to find your first course!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              href={`/watch/${course.id}`}
            />
          ))}
        </div>
      )}
    </>
  );
}
