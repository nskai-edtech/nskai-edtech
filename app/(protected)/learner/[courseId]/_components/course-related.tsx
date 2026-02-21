import { CourseCard } from "@/components/courses/course-card";
import { getRelatedCourses } from "@/actions/courses";

export async function CourseRelated({
  courseId,
  tutorId,
}: {
  courseId: string;
  tutorId?: string | null;
}) {
  if (!tutorId) return null;

  const relatedCourses = await getRelatedCourses(courseId, tutorId);
  if (relatedCourses.length === 0) return null;

  return (
    <div className="mt-32 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-primary-text tracking-tight">
            More Courses for You
          </h2>
          <p className="text-secondary-text mt-2 font-medium">
            Recommended based on your interests and current choice
          </p>
        </div>
        <button className="text-brand font-black text-sm uppercase tracking-widest bg-brand/5 px-6 py-3 rounded-xl border border-brand/10 hover:bg-brand/10 transition-all">
          See All Courses
        </button>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {relatedCourses.map((relatedCourse) => (
          <CourseCard
            key={relatedCourse.id}
            course={relatedCourse}
            href={`/learner/${relatedCourse.id}`}
          />
        ))}
      </div>
    </div>
  );
}
