import { getPendingCourses } from "@/actions/courses";
import { BookOpen, Clock, User, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function ApprovalsPage() {
  const pendingCourses = await getPendingCourses();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-text">
          Pending Approvals
        </h1>
        <p className="text-secondary-text mt-1">
          Review and approve new course submissions from tutors
        </p>
      </div>

      {pendingCourses.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-border rounded-2xl">
          <BookOpen className="w-16 h-16 text-secondary-text/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-primary-text">
            No pending approvals
          </h3>
          <p className="text-secondary-text">
            All submitted courses have been reviewed.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pendingCourses.map((course) => (
            <div
              key={course.id}
              className="bg-surface border border-border rounded-2xl p-4 hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-center"
            >
              <div className="relative w-full md:w-48 aspect-video rounded-xl overflow-hidden bg-surface-muted shrink-0">
                {course.imageUrl ? (
                  <Image
                    src={course.imageUrl}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-secondary-text/50" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-lg font-bold text-primary-text truncate">
                    {course.title}
                  </h3>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    Pending Review
                  </span>
                </div>

                <p className="text-sm text-secondary-text line-clamp-2 mb-4">
                  {course.description || "No description provided."}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-secondary-text">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span className="font-medium">
                      {course.tutor?.firstName} {course.tutor?.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {new Date(course.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>
                      {course.chapters.length} Modules •{" "}
                      {course.chapters.reduce(
                        (acc, c) => acc + c.lessons.length,
                        0,
                      )}{" "}
                      Lessons
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 w-full md:w-auto">
                <Link
                  href={`/org/approvals/${course.id}`}
                  className="flex items-center justify-center gap-2 w-full px-6 py-2.5 bg-brand text-white rounded-xl font-semibold hover:bg-brand/90 transition-all shadow-lg shadow-brand/10"
                >
                  Review Course
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
