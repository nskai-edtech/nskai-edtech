import { getLearningPathDetails } from "@/actions/learning-paths";
import { ArrowLeft, BookOpen, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { CourseSearchModal } from "../_components/course-search-modal";
import { RemoveCourseButton } from "../_components/remove-course-button";
import { PathActions } from "../_components/path-actions";

export default async function PathDetailsPage({
  params,
}: {
  params: Promise<{ pathId: string }>;
}) {
  const { pathId } = await params;
  const path = await getLearningPathDetails(pathId);

  if (!path) return notFound();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Link
        href="/org/paths"
        className="flex items-center gap-2 text-sm font-bold text-secondary-text hover:text-primary-text transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Curriculum
      </Link>

      <div className="flex flex-col gap-6 bg-surface rounded-[32px] p-8 border border-border shadow-sm">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black text-primary-text">
                {path.title}
              </h1>
              {!path.isPublished ? (
                <span className="px-3 py-1 bg-yellow-500/10 text-yellow-600 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-yellow-500/20">
                  Draft
                </span>
              ) : (
                <span className="px-3 py-1 bg-green-500/10 text-green-600 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-green-500/20">
                  Published
                </span>
              )}
            </div>
            <p className="text-secondary-text font-medium leading-relaxed max-w-3xl">
              {path.description}
            </p>
          </div>

          {/* Course Actions: Moved below text for cleaner vertical rhythm */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <PathActions
              pathId={path.id}
              isPublished={!!path.isPublished}
              hasCourses={path.attachedCourses.length > 0}
            />
            <CourseSearchModal pathId={path.id} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-primary-text flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand" />
          Curriculum Sequence ({path.attachedCourses.length})
        </h2>

        {path.attachedCourses.length === 0 ? (
          <div className="bg-surface-muted/30 border border-dashed border-border rounded-3xl p-12 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-brand/30 mb-4" />
            <h3 className="font-bold text-primary-text mb-2">
              No courses attached yet
            </h3>
            <p className="text-sm text-secondary-text max-w-sm mx-auto">
              Search the marketplace below and attach courses to build out this
              learning track!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {path.attachedCourses.map((course, i) => (
              <div
                key={course.mappingId}
                className="flex items-center gap-4 bg-surface border border-border rounded-2xl p-4 shadow-sm"
              >
                <div className="w-10 h-10 shrink-0 bg-surface-muted rounded-full flex items-center justify-center font-black text-secondary-text border border-border shadow-inner">
                  {i + 1}
                </div>

                <div className="relative w-32 aspect-video bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-border/50">
                  {course.imageUrl ? (
                    <Image
                      src={course.imageUrl}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-primary-text truncate">
                    {course.title}
                  </h4>
                  <p className="text-xs text-secondary-text">
                    By {course.tutorFirstName} {course.tutorLastName}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-4 pl-4 border-l border-border">
                  {!course.isPublished && (
                    <span className="text-xs font-bold text-red-500 uppercase flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Unpublished
                    </span>
                  )}
                  <RemoveCourseButton mappingId={course.mappingId} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
