import { getCourseReviewData } from "@/actions/courses";
import { notFound } from "next/navigation";
import { BookOpen, Video, Users, DollarSign, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ReviewActions from "./_components/review-actions";

interface ReviewPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CourseReviewPage({ params }: ReviewPageProps) {
  const { courseId } = await params;
  const course = await getCourseReviewData(courseId);

  if (!course) {
    notFound();
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back Button */}
      <Link
        href="/org/approvals"
        className="inline-flex items-center gap-2 text-sm text-secondary-text hover:text-brand transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Approvals
      </Link>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10 pb-10 border-b border-border">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-primary-text mb-4">
            {course.title}
          </h1>
          <p className="text-secondary-text leading-relaxed max-w-2xl">
            {course.description || "No description provided."}
          </p>

          <div className="flex flex-wrap items-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-secondary-text text-[10px] uppercase font-bold tracking-wider">
                  Tutor
                </p>
                <p className="font-semibold text-primary-text">
                  {course.tutor?.firstName} {course.tutor?.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <p className="text-secondary-text text-[10px] uppercase font-bold tracking-wider">
                  Price
                </p>
                <p className="font-semibold text-primary-text">
                  ₦{((course.price || 0) / 100).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-surface-muted rounded-xl border border-border">
                <p className="text-secondary-text text-[10px] uppercase font-bold tracking-wider">
                  Total Impact
                </p>
                <p className="text-sm font-bold text-primary-text">
                  {course.totalModules} Modules • {course.totalLessons} Lessons
                </p>
              </div>
            </div>
          </div>
        </div>

        <ReviewActions courseId={courseId} />
      </div>

      {/* Review Content (Restricted View) */}
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-bold text-primary-text mb-2 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand" />
            Curriculum Sample
          </h2>
          <p className="text-sm text-secondary-text mb-6">
            Reviewing first module content as per organization policy.
          </p>

          {course.chapters.length > 0 ? (
            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 bg-surface-muted border-b border-border">
                <h3 className="font-bold text-primary-text">
                  Module 1: {course.chapters[0].title}
                </h3>
              </div>

              <div className="divide-y divide-border">
                {course.chapters[0].lessons.map((lesson, idx) => (
                  <div key={lesson.id} className="p-6 group">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand shrink-0">
                        <span className="text-xs font-bold">{idx + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-primary-text mb-1 truncate">
                          {lesson.title}
                        </h4>
                        <p className="text-sm text-secondary-text mb-4 line-clamp-2 italic">
                          {lesson.description ||
                            "No lesson description provided."}
                        </p>

                        {/* Video Mock/Placeholder or Real Mux Player */}
                        {lesson.muxData?.playbackId ? (
                          <div className="aspect-video bg-black rounded-xl overflow-hidden relative group/player">
                            <iframe
                              src={`https://stream.mux.com/${lesson.muxData.playbackId}.m3u8`}
                              className="w-full h-full"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <div className="aspect-video bg-surface-muted rounded-xl flex items-center justify-center border-2 border-dashed border-border">
                            <Video className="w-10 h-10 text-secondary-text/30" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 bg-surface-muted/30 rounded-2xl border border-dashed border-border">
              <p className="text-secondary-text italic text-sm">
                This course has no modules created yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
