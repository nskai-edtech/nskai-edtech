import Link from "next/link";
import Image from "next/image";
import { Play, Clock, BookOpen } from "lucide-react";
import { getContinueLearningCourses } from "@/actions/continue-learning";

export async function ContinueLearningWidget() {
  const courses = await getContinueLearningCourses(4);

  if (courses.length === 0) {
    return (
      <div className="bg-surface-muted/50 rounded-3xl border border-dashed border-border p-8 text-center">
        <BookOpen className="w-12 h-12 text-secondary-text/30 mx-auto mb-3" />
        <p className="text-secondary-text mb-2 font-medium">
          No courses in progress
        </p>
        <Link
          href="/learner/marketplace"
          className="text-brand font-bold hover:underline text-sm"
        >
          Browse courses
        </Link>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {courses.map((course) => (
        <div
          key={course.courseId}
          className="bg-surface border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 relative overflow-hidden group"
        >
          {/* Course Image/Icon */}
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden mb-4 bg-surface-muted">
            {course.courseImageUrl ? (
              <Image
                src={course.courseImageUrl}
                alt={course.courseTitle}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-brand/50" />
              </div>
            )}
          </div>

          {/* Progress Circle */}
          <div className="absolute top-6 right-6">
            <div className="relative w-14 h-14">
              {/* Background circle */}
              <svg className="w-14 h-14 transform -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-surface-muted"
                />
                {/* Progress circle */}
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  strokeDashoffset={`${2 * Math.PI * 24 * (1 - course.progressPercentage / 100)}`}
                  className="text-brand transition-all duration-500"
                  strokeLinecap="round"
                />
              </svg>
              {/* Percentage text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-primary-text">
                  {course.progressPercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Course Title */}
          <h3 className="font-bold text-lg text-primary-text mb-1 line-clamp-1 pr-16">
            {course.courseTitle}
          </h3>

          {/* Last Lesson */}
          <p className="text-sm text-secondary-text mb-2 line-clamp-1">
            {course.lessonTitle}
          </p>

          {/* Last Accessed Time */}
          <div className="flex items-center gap-1.5 text-xs text-secondary-text mb-6">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {course.lastAccessedAt
                ? formatTimeAgo(new Date(course.lastAccessedAt))
                : "Recently"}
            </span>
          </div>

          {/* Continue Button */}
          <Link
            href={`/watch/${course.courseId}/${course.lessonId}`}
            className="w-full flex items-center justify-center gap-2 bg-brand text-white font-bold py-3 rounded-xl hover:bg-brand-dark transition-colors group-hover:shadow-lg group-hover:shadow-brand/20"
          >
            <Play className="w-4 h-4 fill-current" />
            Continue Learning
          </Link>
        </div>
      ))}
    </div>
  );
}

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
}
