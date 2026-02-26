import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, TrendingDown, BookOpen } from "lucide-react";

interface LowPerformingCoursesProps {
  courses: Array<{
    id: string;
    title: string;
    imageUrl: string | null;
    enrollments: number;
    avgRating: number;
    revenue: number;
  }>;
}

export function LowPerformingCourses({ courses }: LowPerformingCoursesProps) {
  if (courses.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-5 h-5 text-secondary-text" />
          <h3 className="text-lg font-semibold text-primary-text">
            Course Health
          </h3>
        </div>
        <div className="py-12 text-center">
          <BookOpen className="w-12 h-12 text-secondary-text/40 mx-auto mb-4" />
          <p className="text-secondary-text font-medium">
            All courses performing well
          </p>
          <p className="text-sm text-secondary-text mt-1">
            No low-performing courses detected
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingDown className="w-5 h-5 text-secondary-text" />
        <h3 className="text-lg font-semibold text-primary-text">
          Courses Needing Attention
        </h3>
      </div>

      <div className="space-y-3">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/tutor/courses/${course.id}`}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-muted/50 transition-colors group border border-transparent hover:border-border"
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-muted shrink-0">
              {course.imageUrl ? (
                <Image
                  src={course.imageUrl}
                  alt={course.title}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-800">
                  <BookOpen className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium text-primary-text text-sm truncate group-hover:text-brand">
                  {course.title}
                </h4>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100/50 dark:bg-red-900/20 shrink-0">
                  <AlertTriangle className="w-3 h-3 text-red-600 dark:text-red-400" />
                  <span className="text-xs font-medium text-red-600 dark:text-red-400">
                    {Number(course.avgRating ?? 0).toFixed(1)}★
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-secondary-text mt-2">
                <span>{course.enrollments} students</span>
                <span>•</span>
                <span>₦{(course.revenue / 100).toLocaleString()}</span>
              </div>

              {course.avgRating < 3.5 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  Consider reviewing course content or increasing engagement
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
