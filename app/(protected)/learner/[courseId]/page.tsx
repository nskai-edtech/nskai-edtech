import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getCourseById } from "@/actions/courses";
import { CourseCurriculum } from "@/components/courses/course-curriculum";
import { CourseVideoPreview } from "@/components/courses/course-video-preview";

import { CourseHero } from "./_components/course-hero";
import { CourseSidebar } from "./_components/course-sidebar";
import { CourseInstructor } from "./_components/course-instructor";
import { CourseRelated } from "./_components/course-related";
import { CourseReviewsWrapper } from "./_components/course-reviews-wrapper";

export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await getCourseById(courseId);

  if (!course || !course.isPublished) {
    return redirect("/learner/marketplace");
  }

  const totalLessons = course.chapters.reduce(
    (acc, chapter) => acc + chapter.lessons.length,
    0,
  );

  // Find the first free preview lesson with a playback ID
  const previewLesson = course.chapters
    .flatMap((chapter) => chapter.lessons)
    .find((lesson) => lesson.isFreePreview && lesson.muxData?.playbackId);

  return (
    <div className="max-w-[1400px] mx-auto pb-20">
      <div className="grid lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-2 space-y-8">
          <Suspense
            fallback={
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/4"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-lg w-3/4"></div>
                <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-lg w-full"></div>
              </div>
            }
          >
            <CourseHero
              courseId={courseId}
              courseTitle={course.title}
              courseDescription={course.description}
              hasCert={course.chapters.length > 0}
              tutor={course.tutor}
            />
          </Suspense>

          <CourseVideoPreview
            imageUrl={course.imageUrl}
            title={course.title}
            previewPlaybackId={previewLesson?.muxData?.playbackId || null}
          />

          <div className="space-y-12 pt-10">
            <CourseCurriculum chapters={course.chapters} />

            <Suspense
              fallback={
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-brand" />
                </div>
              }
            >
              <CourseInstructor tutor={course.tutor} />
            </Suspense>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 space-y-6">
          <Suspense
            fallback={
              <div className="h-[400px] bg-gray-200 dark:bg-gray-800 animate-pulse rounded-3xl"></div>
            }
          >
            <CourseSidebar
              courseId={courseId}
              price={course.price}
              totalLessons={totalLessons}
            />
          </Suspense>
        </div>
      </div>

      <div className="mt-20">
        <Suspense
          fallback={
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-brand" />
            </div>
          }
        >
          <CourseReviewsWrapper courseId={courseId} />
        </Suspense>
      </div>

      <Suspense
        fallback={
          <div className="mt-32 flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
          </div>
        }
      >
        <CourseRelated courseId={courseId} tutorId={course.tutorId} />
      </Suspense>
    </div>
  );
}
