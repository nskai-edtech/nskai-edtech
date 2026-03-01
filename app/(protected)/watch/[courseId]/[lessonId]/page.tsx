import { getCourseOutline, getLessonWithAccess } from "@/actions/lesson-viewer";
import { VideoPlayer } from "@/components/video-player";
import { CourseSidebar } from "@/components/watch/course-sidebar";
import { LessonTabs } from "@/components/watch/lesson-tabs";
import { ArrowLeft, ChevronRight, HelpCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getQuestions } from "@/actions/qa";

import { QuestionWithRelations } from "@/types";
import { QuizPlayer } from "@/components/watch/quiz-player";
import {
  getLastQuizAttempt,
  getQuizQuestionsAdmin,
} from "@/actions/quiz/queries";
import { CustomAccordion } from "@/components/ui/custom-accordion";
import { CourseMobileSidebar } from "@/components/watch/course-mobile-sidebar";
import { getUserProgress } from "@/actions/progress/queries";
import { QuizGate } from "@/components/watch/quiz-gate";

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
  const quizQuestionsPromise = getQuizQuestionsAdmin(lessonId);
  const quizAttemptPromise = getLastQuizAttempt(lessonId);
  const progressPromise = getUserProgress(courseId);

  const [
    course,
    lessonData,
    questionsResult,
    quizQuestionsResult,
    quizAttempt,
    progressData,
  ] = await Promise.all([
    courseOutlinePromise,
    lessonDataPromise,
    questionsPromise,
    quizQuestionsPromise,
    quizAttemptPromise,
    progressPromise,
  ]);

  const questions: QuestionWithRelations[] = questionsResult?.questions || [];
  const progressCount = "error" in progressData ? 0 : progressData.percentage;

  const rawQuizQuestions =
    "questions" in quizQuestionsResult ? quizQuestionsResult.questions : [];

  const safeQuizQuestions = rawQuizQuestions.map((q) => {
    if (!quizAttempt?.passed) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { correctOption: _, ...safeQuestion } = q;
      return safeQuestion;
    }
    return q;
  });

  if (!course) {
    return redirect("/learner/enrolled");
  }

  if (!lessonData) {
    return redirect(`/watch/${courseId}`);
  }

  const { lesson, muxData, nextLessonId, prevLessonId, userProgress } =
    lessonData;
  const isQuiz = lesson.type === "QUIZ" || rawQuizQuestions.length > 0;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Navigation Bar */}
      <div className="h-16 border-b border-border bg-surface flex items-center justify-between px-4 md:px-6 shrink-0 z-10">
        <div className="flex items-center gap-3 md:gap-4">
          <Link
            href="/learner/enrolled"
            className="flex items-center gap-2 p-2 md:px-4 md:py-2 hover:bg-surface-muted rounded-full md:rounded-xl transition-colors text-secondary-text hover:text-primary-text"
            title="Back to enrolled courses"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden md:inline-block font-bold">Courses</span>
          </Link>

          <div className="hidden sm:block border-l border-border h-8 mx-1" />

          <div>
            <h1 className="font-bold text-[10px] md:text-sm text-secondary-text uppercase tracking-wider hidden md:block">
              Course
            </h1>
            <h2 className="font-bold text-sm md:text-lg text-primary-text leading-tight line-clamp-1 max-w-37.5 sm:max-w-xs md:max-w-md">
              {course.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Link
            href="/learner"
            className="text-sm font-bold text-brand hover:underline hidden sm:block mr-2"
          >
            Dashboard
          </Link>
          <CourseMobileSidebar
            course={course}
            currentLessonId={lessonId}
            purchase={true}
            progressCount={progressCount}
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-surface-muted/30">
          <div className="max-w-5xl mx-auto p-6 md:p-10">
            {/* Content Container (Video) */}
            {muxData?.playbackId ? (
              <div className="relative aspect-video w-full bg-slate-900 rounded-2xl overflow-hidden isolate shadow-2xl shadow-black/5 mb-8 border border-border/50 group">
                <VideoPlayer
                  playbackId={muxData.playbackId}
                  title={lesson.title}
                  lessonId={lessonId}
                  lastPlaybackPosition={userProgress?.lastPlaybackPosition || 0}
                />
              </div>
            ) : (
              !isQuiz && (
                <div className="aspect-video bg-surface rounded-2xl overflow-hidden shadow-2xl shadow-black/5 mb-8 border border-border/50 relative group">
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/50 bg-slate-900">
                    <p>Video processing or not available</p>
                  </div>
                </div>
              )
            )}

            {/* Quiz Container (Rendered below video if it exists) */}
            {isQuiz && rawQuizQuestions.length > 0 && (
              <div className="mb-8">
                <QuizGate
                  key={lessonId}
                  videoCompleted={!!userProgress?.isCompleted}
                  lessonId={lessonId}
                  hasVideo={!!muxData?.playbackId}
                >
                  <CustomAccordion
                    title={
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand/10 rounded-xl">
                          <HelpCircle className="w-6 h-6 text-brand" />
                        </div>
                        <span className="text-xl font-bold">
                          Take Quiz: {lesson.title}
                        </span>
                      </div>
                    }
                    defaultOpen={!quizAttempt?.passed}
                  >
                    <QuizPlayer
                      lessonId={lessonId}
                      questions={safeQuizQuestions}
                      lastAttempt={quizAttempt}
                    />
                  </CustomAccordion>
                </QuizGate>
              </div>
            )}
            {isQuiz && rawQuizQuestions.length === 0 && (
              <div className="mb-8 text-center py-12 text-secondary-text bg-surface rounded-2xl border border-border">
                No questions in this quiz yet.
              </div>
            )}

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
                  <>
                    {isQuiz &&
                    rawQuizQuestions.length > 0 &&
                    !quizAttempt?.passed ? (
                      <button
                        disabled
                        className="flex items-center gap-2 px-6 py-3 bg-surface-muted text-secondary-text font-bold rounded-xl cursor-not-allowed opacity-50"
                        title="You must pass the quiz to continue"
                      >
                        Next Lesson <ChevronRight className="w-5 h-5" />
                      </button>
                    ) : (
                      <Link
                        href={`/watch/${courseId}/${nextLessonId}`}
                        className="flex items-center gap-2 px-6 py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand-dark transition-colors shadow-lg shadow-brand/20"
                      >
                        Next Lesson <ChevronRight className="w-5 h-5" />
                      </Link>
                    )}
                  </>
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

        {/* Sidebar (List of Lessons) - Hidden on mobile */}
        <div className="hidden lg:flex w-87.5 shrink-0 h-full overflow-hidden border-l border-border bg-surface flex-col">
          <div className="flex-1 overflow-y-auto">
            <CourseSidebar
              course={course}
              currentLessonId={lessonId}
              purchase={true}
              progressCount={progressCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
