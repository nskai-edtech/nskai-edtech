import { getCourseOutline, getLessonWithAccess } from "@/actions/lesson-viewer";
import { VideoPlayer } from "@/components/video-player";
import { CourseSidebar } from "@/components/watch/course-sidebar";
import { LessonTabs } from "@/components/watch/lesson-tabs";
import { ArrowLeft, ChevronRight, HelpCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getQuestions } from "@/actions/qa";
import { getQuizQuestions, getLastQuizAttempt } from "@/actions/quiz";
import { QuestionWithRelations } from "@/types";
import { QuizPlayer } from "@/components/watch/quiz-player";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;

  const courseOutlinePromise = getCourseOutline(courseId);

  const lessonDataPromise = getLessonWithAccess(courseId, lessonId).catch(
    () => null,
  );

  const questionsPromise = getQuestions(lessonId);
  const quizQuestionsPromise = getQuizQuestions(lessonId);
  const quizAttemptPromise = getLastQuizAttempt(lessonId);

  const [
    course,
    lessonData,
    questionsResult,
    quizQuestionsResult,
    quizAttempt,
  ] = await Promise.all([
    courseOutlinePromise,
    lessonDataPromise,
    questionsPromise,
    quizQuestionsPromise,
    quizAttemptPromise,
  ]);

  const questions: QuestionWithRelations[] = questionsResult?.questions || [];
  const quizQuestions =
    "questions" in quizQuestionsResult ? quizQuestionsResult.questions : [];

  if (!course) {
    return redirect("/learner/enrolled");
  }

  if (!lessonData) {
    return redirect(`/watch/${courseId}`); // Or 404
  }

  const { lesson, muxData, nextLessonId, prevLessonId } = lessonData;
  const isQuiz = lesson.type === "QUIZ";

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Navigation Bar */}
      <div className="h-16 border-b border-border bg-surface flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Link
            href="/learner/enrolled"
            className="p-2 hover:bg-surface-muted rounded-full transition-colors text-secondary-text hover:text-primary-text"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-sm text-secondary-text uppercase tracking-wider">
              Course
            </h1>
            <h2 className="font-bold text-lg text-primary-text leading-none">
              {course.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/learner"
            className="text-sm font-bold text-brand hover:underline"
          >
            Dashboard
          </Link>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-surface-muted/30">
          <div className="max-w-5xl mx-auto p-6 md:p-10">
            {/* Content Container (Video or Quiz) */}
            <div className="aspect-video bg-surface rounded-2xl overflow-hidden shadow-2xl shadow-black/5 mb-8 border border-border/50 relative group">
              {isQuiz ? (
                <div className="w-full h-full overflow-y-auto p-6 md:p-12 bg-surface">
                  <div className="max-w-2xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-brand/10 rounded-xl">
                        <HelpCircle className="w-8 h-8 text-brand" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-primary-text">
                          Quiz: {lesson.title}
                        </h2>
                        <p className="text-secondary-text">
                          Test your knowledge.
                        </p>
                      </div>
                    </div>
                    {quizQuestions.length > 0 ? (
                      <QuizPlayer
                        lessonId={lessonId}
                        questions={quizQuestions}
                        lastAttempt={quizAttempt}
                      />
                    ) : (
                      <div className="text-center py-12 text-secondary-text">
                        No questions in this quiz yet.
                      </div>
                    )}
                  </div>
                </div>
              ) : muxData?.playbackId ? (
                <VideoPlayer
                  playbackId={muxData.playbackId}
                  title={lesson.title}
                  lessonId={lessonId}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/50 bg-slate-900">
                  <p>Video processing or not available</p>
                </div>
              )}
            </div>

            {/* Lesson Title & Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-primary-text mb-2">
                  {lesson.title}
                </h1>
                <p className="text-secondary-text">
                  Module {lesson.chapter?.position}: {lesson.chapter?.title}
                </p>
              </div>

              <div className="flex gap-2">
                {/* Previous Lesson Button */}
                {prevLessonId && (
                  <Link
                    href={`/watch/${courseId}/${prevLessonId}`}
                    className="flex items-center gap-2 px-4 py-3 bg-surface border border-border text-primary-text font-bold rounded-xl hover:bg-surface-muted transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" /> Prev
                  </Link>
                )}

                {/* Next Lesson Button */}
                {nextLessonId && (
                  <Link
                    href={`/watch/${courseId}/${nextLessonId}`}
                    className="flex items-center gap-2 px-6 py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand-dark transition-colors shadow-lg shadow-brand/20"
                  >
                    Next Lesson <ChevronRight className="w-5 h-5" />
                  </Link>
                )}
              </div>
            </div>

            {/* Tabs (Notes / Q&A) - Only show if not a quiz or if desired */}
            <LessonTabs
              lesson={lesson}
              lessonId={lessonId}
              tutorNotes={lesson.notes}
              questions={questions}
            />
          </div>
        </div>

        {/* Sidebar (List of Lessons) */}
        <div className="w-[350px] shrink-0 hidden lg:block h-full overflow-hidden border-l border-border bg-surface flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <CourseSidebar
              course={course}
              currentLessonId={lessonId}
              purchase={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
