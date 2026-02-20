import { getCompletedCourses } from "@/actions/certificates";
import { Award, Calendar, BookOpen, Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

export default async function CertificatesPage() {
  const clerkUser = await currentUser();
  const result = await getCompletedCourses();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  if ("error" in result) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-red-500">{result.error}</p>
      </div>
    );
  }

  const { courses } = result;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-primary-text flex items-center gap-3">
            <Award className="w-8 h-8 text-brand" />
            My Certificates
          </h1>
          <p className="text-secondary-text mt-2">
            View and download your course completion certificates
          </p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4 text-center">
          <div className="text-3xl font-black text-brand mb-1">
            {courses.length}
          </div>
          <div className="text-xs font-bold text-secondary-text uppercase tracking-wider">
            Certificates
          </div>
        </div>
      </div>

      {/* Certificates Grid */}
      {courses.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const formattedDate = new Date(
              course.completionDate,
            ).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div
                key={course.courseId}
                className="bg-surface border border-border rounded-3xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Course Thumbnail */}
                <div className="relative h-40 bg-surface-muted">
                  {course.courseImageUrl ? (
                    <Image
                      src={course.courseImageUrl}
                      alt={course.courseTitle}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-secondary-text" />
                    </div>
                  )}
                  {/* Certificate Badge */}
                  <div className="absolute top-3 right-3 bg-brand text-white p-2 rounded-full">
                    <Award className="w-5 h-5" />
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-primary-text mb-2 line-clamp-2">
                    {course.courseTitle}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-secondary-text">
                      <Calendar className="w-4 h-4" />
                      <span>Completed {formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-secondary-text">
                      <BookOpen className="w-4 h-4" />
                      <span>{course.totalLessons} lessons</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/learner/certificates/${course.courseId}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-brand text-white font-bold rounded-xl hover:bg-brand-dark transition-colors"
                    >
                      <Award className="w-4 h-4" />
                      View
                    </Link>
                    <Link
                      href={`/learner/certificates/${course.courseId}?download=true`}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-surface-muted text-primary-text font-bold rounded-xl hover:bg-surface border border-border transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-surface border border-border rounded-3xl p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-surface-muted flex items-center justify-center mb-6">
            <Award className="w-10 h-10 text-secondary-text" />
          </div>
          <h2 className="text-2xl font-bold text-primary-text mb-3">
            No Certificates Yet
          </h2>
          <p className="text-secondary-text mb-6 max-w-md">
            Complete a course to earn your first certificate! Certificates are
            automatically generated when you finish all lessons in a course.
          </p>
          <Link
            href="/learner/marketplace"
            className="px-6 py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand-dark transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      )}
    </div>
  );
}
