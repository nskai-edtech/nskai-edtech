import { type CoursePerformance } from "@/actions/analytics";
import { formatPrice } from "@/lib/format";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, BarChart3, ArrowUpRight } from "lucide-react";

function CourseRow({ course }: { course: CoursePerformance }) {
  return (
    <tr className="hover:bg-surface-muted/50 transition-colors border-b border-border last:border-0">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-muted shrink-0">
            {course.imageUrl ? (
              <Image
                src={course.imageUrl}
                alt={course.title}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-secondary-text" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-primary-text text-sm truncate max-w-[200px]">
              {course.title}
            </p>
            <p className="text-xs text-secondary-text">
              {course.totalLessons} lessons
            </p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4 text-right text-sm text-secondary-text tabular-nums">
        {formatPrice(course.price)}
      </td>
      <td className="px-5 py-4 text-right text-sm font-medium text-primary-text tabular-nums">
        {course.totalEnrollments}
      </td>
      <td className="px-5 py-4 text-right text-sm font-medium text-primary-text tabular-nums">
        {formatPrice(course.totalRevenue)}
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2 justify-end">
          <div className="w-16 h-1.5 bg-surface-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${course.completionRate}%` }}
            />
          </div>
          <span className="text-xs font-medium text-secondary-text tabular-nums w-8 text-right">
            {course.completionRate}%
          </span>
        </div>
      </td>
      <td className="px-5 py-4 text-right text-sm tabular-nums">
        {course.avgQuizScore !== null ? (
          <span
            className={`font-medium ${
              course.avgQuizScore >= 70
                ? "text-green-600 dark:text-green-400"
                : "text-amber-600 dark:text-amber-400"
            }`}
          >
            {course.avgQuizScore}%
          </span>
        ) : (
          <span className="text-secondary-text">–</span>
        )}
      </td>
    </tr>
  );
}

export function CoursePerformanceTable({
  courses,
}: {
  courses: CoursePerformance[];
}) {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-secondary-text" />
          <h2 className="font-semibold text-lg text-primary-text">
            Course Performance
          </h2>
        </div>
        <Link
          href="/tutor/courses"
          className="text-sm text-brand hover:underline font-medium flex items-center gap-1"
        >
          Manage <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted/50 text-secondary-text">
            <tr>
              <th className="px-5 py-3 font-medium">Course</th>
              <th className="px-5 py-3 font-medium text-right">Price</th>
              <th className="px-5 py-3 font-medium text-right">Students</th>
              <th className="px-5 py-3 font-medium text-right">Revenue</th>
              <th className="px-5 py-3 font-medium text-right">Completion</th>
              <th className="px-5 py-3 font-medium text-right">Quiz Avg</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-secondary-text"
                >
                  No courses yet. Start creating to see analytics.
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <CourseRow key={course.id} course={course} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
