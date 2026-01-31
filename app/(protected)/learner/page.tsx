import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getEnrolledCourses } from "@/actions/courses";
import { CourseCard } from "@/components/courses/course-card";

export default async function LearnerDashboard() {
  const courses = await getEnrolledCourses();

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Learning</h1>
          <p className="text-secondary-text mt-1">Pick up where you left off</p>
        </div>
        {courses.length > 0 && (
          <Link
            href="/learner/enrolled"
            className="flex items-center gap-1 text-sm font-medium text-brand hover:underline transition-all"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 border rounded-3xl bg-surface-muted/30 border-border">
          <div className="w-20 h-20 bg-surface rounded-2xl flex items-center justify-center mb-6 shadow-sm ring-1 ring-border">
            <span className="text-3xl text-brand">👋</span>
          </div>
          <h3 className="text-xl font-semibold text-primary-text mb-2 tracking-tight">
            Welcome to your dashboard!
          </h3>
          <p className="text-secondary-text text-center max-w-sm mb-8 leading-relaxed">
            You are not enrolled in any courses yet. Start your journey by
            exploring our marketplace.
          </p>
          <Link
            href="/learner/marketplace"
            className="px-8 py-3 bg-brand text-white font-semibold rounded-xl hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 active:scale-95"
          >
            Explore Marketplace
          </Link>
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
