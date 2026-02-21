import { getPathLessons } from "@/actions/learning-paths";
import {
  ArrowLeft,
  ChevronRight,
  PlayCircle,
  Rocket,
  Layers,
  CheckCircle2,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function PathViewPage({
  params,
}: {
  params: Promise<{ pathId: string }>;
}) {
  const { pathId } = await params;
  const data = await getPathLessons(pathId);

  if (!data) {
    // If not enrolled or not found
    redirect(`/learner/paths/${pathId}`);
  }

  const { path, courses } = data;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/learner/paths/${pathId}`}
              className="p-2 hover:bg-surface-muted rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-secondary-text" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Layers className="w-4 h-4 text-brand" />
                <span className="text-[10px] font-black uppercase tracking-widest text-brand">
                  Learning Track
                </span>
              </div>
              <h1 className="text-xl font-black text-primary-text truncate max-w-[300px] md:max-w-md">
                {path.title}
              </h1>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-bold text-secondary-text uppercase tracking-wider">
                Progress
              </p>
              <p className="text-sm font-black text-primary-text">
                {courses.length} Courses Unlocked
              </p>
            </div>
            <div className="w-12 h-12 bg-brand/10 border border-brand/20 rounded-2xl flex items-center justify-center text-brand">
              <Rocket className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-6 md:p-10 space-y-12">
        {/* Course Sequence */}
        <div className="space-y-10">
          {courses.map((course, courseIdx) => (
            <div key={course.id} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-primary-text text-white flex items-center justify-center font-black text-lg shadow-lg">
                  {courseIdx + 1}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-primary-text leading-none">
                    {course.title}
                  </h2>
                  <p className="text-sm text-secondary-text mt-1 font-medium italic">
                    Course {courseIdx + 1} of {courses.length}
                  </p>
                </div>
              </div>

              <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm">
                {course.chapters.length === 0 ? (
                  <div className="p-8 text-center text-secondary-text font-medium">
                    No curriculum content added yet for this course.
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {course.chapters.map((chapter) => (
                      <div key={chapter.id} className="p-6 md:p-8 space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-lg text-primary-text flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-brand" />
                            {chapter.title}
                          </h3>
                          <span className="text-[10px] font-black text-secondary-text uppercase tracking-widest bg-surface-muted px-2 py-1 rounded">
                            {chapter.lessons.length} Lessons
                          </span>
                        </div>

                        <div className="grid gap-3">
                          {chapter.lessons.map((lesson) => (
                            <Link
                              key={lesson.id}
                              href={`/watch/${course.id}?lessonId=${lesson.id}`}
                              className="group flex items-center justify-between p-4 bg-background border border-border rounded-2xl hover:border-brand/50 hover:bg-brand/5 transition-all active:scale-[0.98]"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-surface-muted flex items-center justify-center text-secondary-text group-hover:text-brand group-hover:bg-brand/10 transition-colors">
                                  <PlayCircle className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="font-bold text-primary-text group-hover:text-brand transition-colors">
                                    {lesson.title}
                                  </p>
                                  <div className="flex items-center gap-3 mt-0.5">
                                    <span className="text-[10px] font-bold text-secondary-text flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {lesson.type === "VIDEO"
                                        ? "Video Lesson"
                                        : "Quiz"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="shrink-0 w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:bg-brand group-hover:text-white group-hover:border-brand transition-all">
                                  <ChevronRight className="w-4 h-4" />
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Completion Info */}
        <div className="bg-linear-to-br from-brand/10 to-brand/5 border border-brand/20 p-8 md:p-12 rounded-[40px] text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10" />

          <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10 text-brand" />
          </div>

          <h2 className="text-3xl font-black text-primary-text tracking-tight">
            Level Up Your Journey
          </h2>
          <p className="text-secondary-text max-w-lg mx-auto font-medium">
            Complete all courses in the{" "}
            <span className="text-brand font-bold">{path.title}</span> track to
            earn your exclusive certification!
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2 px-6 py-3 bg-white/50 backdrop-blur-sm rounded-2xl border border-white">
              <Layers className="w-5 h-5 text-brand" />
              <span className="font-bold text-sm">
                {courses.length} Certified Courses
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
