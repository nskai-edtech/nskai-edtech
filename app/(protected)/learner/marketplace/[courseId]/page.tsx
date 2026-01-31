import { redirect } from "next/navigation";
import Image from "next/image";
import {
  getCourseById,
  getRelatedCourses,
  checkEnrollment,
} from "@/actions/courses";
import { CourseCard } from "@/components/courses/course-card";
import { CourseCurriculum } from "@/components/courses/course-curriculum";
import { CourseEnrollButton } from "@/components/courses/course-enroll-button";
import { Star, Video, Download, Globe, GraduationCap } from "lucide-react";

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

  const isEnrolled = await checkEnrollment(courseId);
  const relatedCourses = course.tutorId
    ? await getRelatedCourses(courseId, course.tutorId)
    : [];

  const totalLessons = course.chapters.reduce(
    (acc, chapter) => acc + chapter.lessons.length,
    0,
  );

  return (
    <div className="max-w-[1400px] mx-auto pb-20">
      {/* Hero Section */}
      <div className="grid lg:grid-cols-3 gap-10 items-start">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center gap-2 text-brand font-bold text-xs uppercase tracking-widest mb-4">
              <span className="bg-brand/10 px-3 py-1 rounded-full">Course</span>
              {course.chapters.length > 0 && (
                <span className="bg-orange-500/10 text-orange-600 px-3 py-1 rounded-full border border-orange-500/20">
                  Certification Available
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-primary-text leading-[1.15] mb-6">
              {course.title}
            </h1>
            <p className="text-xl text-secondary-text leading-relaxed max-w-3xl">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 mt-8">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className="w-4 h-4 fill-orange-400 text-orange-400"
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-primary-text">4.8</span>
                <span className="text-xs text-secondary-text font-medium">
                  (2,450 reviews)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full border-2 border-surface bg-gray-100 flex items-center justify-center overflow-hidden"
                    >
                      <Image
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`}
                        alt="student"
                        width={24}
                        height={24}
                      />
                    </div>
                  ))}
                </div>
                <span className="text-xs text-secondary-text font-medium">
                  <span className="text-primary-text font-bold">15,243</span>{" "}
                  students enrolled
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-8 pt-8 border-t border-border">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-border">
                {course.tutor?.imageUrl ? (
                  <Image
                    src={course.tutor.imageUrl}
                    alt={course.tutor.firstName || "Tutor"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-brand/10 flex items-center justify-center text-brand font-bold">
                    {course.tutor?.firstName?.[0]}
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-secondary-text font-semibold uppercase tracking-wider">
                  Created by
                </p>
                <p className="text-base font-bold text-brand hover:underline cursor-pointer">
                  {course.tutor?.firstName} {course.tutor?.lastName}
                </p>
              </div>
            </div>
          </div>

          {/* Main Video Preview / Image */}
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-border bg-black/5 group cursor-pointer shadow-2xl shadow-brand/10">
            {course.imageUrl ? (
              <Image
                src={course.imageUrl}
                alt={course.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Video className="w-20 h-20 text-brand/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl border border-white/30 transform group-hover:scale-110 transition-transform duration-300">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-inner">
                  <div className="w-0 h-0 border-t-10 border-t-transparent border-l-18 border-l-brand border-b-10 border-b-transparent ml-1" />
                </div>
              </div>
            </div>
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white/90">
              <span className="text-sm font-bold bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                Preview: Introduction to {course.title}
              </span>
            </div>
          </div>

          {/* Tabs / Content */}
          <div className="space-y-12 pt-10">
            <CourseCurriculum chapters={course.chapters} />

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-primary-text flex items-center gap-3">
                <GraduationCap className="w-7 h-7 text-brand" />
                About the Instructor
              </h2>
              <div className="bg-surface border border-border rounded-3xl p-8 flex flex-col md:flex-row gap-8">
                <div className="relative w-32 h-32 rounded-3xl overflow-hidden shadow-xl border border-border shrink-0">
                  {course.tutor?.imageUrl ? (
                    <Image
                      src={course.tutor.imageUrl}
                      alt={course.tutor.firstName || "Tutor"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-brand/10 flex items-center justify-center text-3xl text-brand font-bold">
                      {course.tutor?.firstName?.[0]}
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-brand">
                      {course.tutor?.firstName} {course.tutor?.lastName}
                    </h3>
                    <p className="text-secondary-text font-medium italic mt-1">
                      AI Research Lead & Principal Course Designer
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 py-2 border-y border-border/50">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                      <span className="text-sm font-bold text-primary-text">
                        4.9 Instructor Rating
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-secondary-text">
                      <Globe className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        82,451 Reviews
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-secondary-text">
                      <GraduationCap className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        450,210 Students
                      </span>
                    </div>
                  </div>
                  <p className="text-secondary-text leading-relaxed">
                    {course.tutor?.firstName} brings over 15 years of industry
                    experience to NSKAI-EdTech. Specializing in practical
                    application, their courses focus on bridging the gap between
                    complex technical concepts and real-world results.
                  </p>
                  <button className="text-brand font-bold text-sm hover:underline flex items-center gap-1 transition-all">
                    View Full Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:sticky lg:top-24 space-y-6">
          <div className="bg-surface border border-border rounded-3xl p-6 shadow-xl shadow-brand/5 ring-1 ring-border">
            <div className="space-y-6">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-primary-text">
                  {course.price
                    ? `₦${(course.price / 100).toLocaleString()}`
                    : "Free"}
                </span>
                {course.price && (
                  <span className="text-lg text-secondary-text line-through font-medium opacity-50">
                    ₦${(course.price / 80).toLocaleString()}
                  </span>
                )}
              </div>

              <CourseEnrollButton
                courseId={courseId}
                isEnrolled={isEnrolled}
                price={course.price}
              />

              <p className="text-[10px] text-center text-secondary-text font-semibold uppercase tracking-wider">
                30-day money-back guarantee
              </p>

              <div className="space-y-4 pt-6 border-t border-border">
                <h4 className="font-bold text-primary-text text-sm">
                  This course includes:
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm text-secondary-text">
                    <Video className="w-4 h-4 text-brand" />
                    <span className="font-medium text-primary-text/80">
                      {totalLessons} on-demand video lessons
                    </span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-secondary-text">
                    <Download className="w-4 h-4 text-brand" />
                    <span className="font-medium text-primary-text/80">
                      12 downloadable resources
                    </span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-secondary-text">
                    <Globe className="w-4 h-4 text-brand" />
                    <span className="font-medium text-primary-text/80">
                      Full lifetime access
                    </span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-secondary-text">
                    <Star className="w-4 h-4 text-brand" />
                    <span className="font-medium text-primary-text/80">
                      Certificate of completion
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Courses */}
      {relatedCourses.length > 0 && (
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
                href={`/learner/marketplace/${relatedCourse.id}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
