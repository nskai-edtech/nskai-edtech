import { getLearningPathDetails } from "@/actions/learning-paths";
import { ArrowLeft, BookOpen, Layers } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { EnrollPathButton } from "../_components/enroll-path-button";

export default async function LearnerPathDetailsPage({
  params,
}: {
  params: Promise<{ pathId: string }>;
}) {
  const { pathId } = await params;
  const path = await getLearningPathDetails(pathId);

  // If path doesn't exist or isn't published
  if (!path || !path.isPublished) return notFound();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <Link
        href="/learner/marketplace"
        className="flex items-center gap-2 text-sm font-bold text-secondary-text hover:text-primary-text transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </Link>

      {/* Hero Banner Area */}
      <div className="bg-linear-to-br from-brand/10 to-brand/5 rounded-[32px] p-8 md:p-12 border border-brand/20 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-brand" />
            <span className="text-sm font-black text-brand uppercase tracking-wider">
              Curriculum Track
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-primary-text mb-4 leading-tight">
            {path.title}
          </h1>
          <p className="text-lg text-secondary-text mb-8">{path.description}</p>

          <EnrollPathButton pathId={path.id} />
        </div>
      </div>

      {/* Course Sequence List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-primary-text flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-brand" />
          Track Curriculum ({path.attachedCourses.length} Courses)
        </h2>

        <div className="space-y-4 relative">
          {/* Vertical connecting line for visual sequence */}
          <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-border z-0" />

          {path.attachedCourses.map((course, i) => (
            <div
              key={course.mappingId}
              className="relative z-10 p-6 bg-surface border border-border rounded-3xl flex flex-col md:flex-row gap-6 items-start md:items-center shadow-sm hover:border-brand/30 transition-colors"
            >
              {/* Sequence number node */}
              <div className="w-14 h-14 shrink-0 bg-background rounded-full flex items-center justify-center font-black text-xl text-primary-text border-4 border-surface shadow-sm ring-1 ring-border">
                {i + 1}
              </div>

              {/* Course Image */}
              <div className="relative w-full md:w-48 aspect-video bg-gray-100 rounded-2xl overflow-hidden shrink-0 border border-border/50">
                {course.imageUrl ? (
                  <Image
                    src={course.imageUrl}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Course Info */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-primary-text mb-2">
                  {course.title}
                </h3>
                <p className="text-sm text-secondary-text font-medium mb-4">
                  Instructor: {course.tutorFirstName} {course.tutorLastName}
                </p>
                <Link
                  href={`/learner/${course.courseId}`}
                  className="text-sm font-bold text-brand hover:underline"
                >
                  View full course details &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
