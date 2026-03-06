import Link from "next/link";
import { ArrowRight, Calendar, ChevronRight, Sparkles } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import { ContinueLearningWidget } from "@/components/learner/continue-learning-widget";
import { LearnerGreeting } from "@/components/learner/learner-greeting";
import { getLearnerStats } from "@/actions/profile/actions";
import { getRecommendedCourses } from "@/actions/recommendations/actions";
import { getUserSkillProfile } from "@/actions/skills/queries";
import { SkillSummaryWidget } from "@/components/skills/skill-mastery";
import DashboardAiChatModal from "@/components/dashboard/DashboardAiChatModal";

interface Session {
  id: string;
  title: string;
  time: string;
  type: "Online Session" | "Group Workshop" | "Critical Deadline";
  date: { day: string; date: number };
  color: string;
}

const UPCOMING_SESSIONS: Session[] = [
  {
    id: "1",
    title: "AI Ethics Seminar",
    time: "2:00 PM - 3:30 PM",
    type: "Online Session",
    date: { day: "OCT", date: 12 },
    color: "border-blue-500 text-blue-500",
  },
  {
    id: "2",
    title: "Project Review: Chatbots",
    time: "10:00 AM - 11:00 AM",
    type: "Group Workshop",
    date: { day: "OCT", date: 14 },
    color: "border-purple-500 text-purple-500",
  },
  {
    id: "3",
    title: "Python Basics Quiz",
    time: "Deadline: 11:59 PM",
    type: "Critical Deadline",
    date: { day: "OCT", date: 15 },
    color: "border-orange-500 text-orange-500",
  },
];

export default async function LearnerDashboard() {
  const user = await currentUser();
  const recommendedCourses = await getRecommendedCourses(8);
  const statsResult = await getLearnerStats();
  const skillProfileResult = await getUserSkillProfile();
  const skillsList =
    "error" in skillProfileResult ? [] : skillProfileResult.skills;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get stats or use defaults
  const stats =
    "error" in statsResult
      ? {
          totalCoursesEnrolled: 0,
          totalLessonsCompleted: 0,
          completionRate: 0,
          points: 0,
          currentStreak: 0,
        }
      : statsResult;

  return (
    <div className="space-y-8 min-w-0">
      {/* Header Section */}
      <div>
        <LearnerGreeting name={user?.firstName || "Learner"} />
        <p className="text-secondary-text mt-2 text-lg">
          Keep up the great work on your learning journey!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-center">
          <span className="text-2xl mb-1">📚</span>
          <span className="font-extrabold text-xl text-primary-text">
            {stats.totalCoursesEnrolled}
          </span>
          <span className="text-xs font-bold text-secondary-text tracking-wider uppercase">
            Enrolled
          </span>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-center">
          <span className="text-2xl mb-1">📈</span>
          <span className="font-extrabold text-xl text-primary-text">
            {stats.completionRate}%
          </span>
          <span className="text-xs font-bold text-secondary-text tracking-wider uppercase">
            Progress
          </span>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-center">
          <span className="text-2xl mb-1">🔥</span>
          <span className="font-extrabold text-xl text-primary-text">
            {stats.currentStreak || 0}
          </span>
          <span className="text-xs font-bold text-secondary-text tracking-wider uppercase">
            Days
          </span>
        </div>
        <div className="bg-brand/10 border border-brand/20 rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-center">
          <span className="text-2xl mb-1">🏆</span>
          <span className="font-extrabold text-xl text-brand">
            {(stats.points || 0).toLocaleString()}
          </span>
          <span className="text-xs font-bold text-secondary-text tracking-wider uppercase">
            XP
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Continue Learning Section */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary-text">
              Continue Learning
            </h2>
            <Link
              href="/learner/enrolled"
              className="text-brand font-semibold text-sm hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <ContinueLearningWidget />

          {/* Recommended Section */}
          <div className="bg-surface-muted/30 rounded-[40px] p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-primary-text">
                Recommended for You
              </h2>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-full border border-border bg-surface flex items-center justify-center hover:bg-surface-muted">
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
                <button className="w-8 h-8 rounded-full border border-border bg-surface flex items-center justify-center hover:bg-surface-muted">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {recommendedCourses.map((course) => {
                const isNew = new Date(course.createdAt) > thirtyDaysAgo;

                return (
                  <Link
                    key={course.id}
                    href={`/learner/${course.id}`}
                    className="block group"
                  >
                    <div className="bg-surface rounded-3xl p-4 border border-border hover:-translate-y-1 transition-transform">
                      {/* Image + Text row */}
                      <div className="flex items-start gap-4">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-surface-muted shrink-0">
                          {course.imageUrl ? (
                            <Image
                              src={course.imageUrl}
                              alt={course.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Sparkles className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {isNew && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-md">
                                New
                              </span>
                            )}
                            {course.matchScore > 0 && (
                              <span className="text-[11px] font-bold text-brand">
                                {course.matchScore}% Match
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-base text-primary-text mb-1 line-clamp-1 group-hover:text-brand transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-xs text-secondary-text mb-2 line-clamp-1">
                            {course.tutor?.firstName || "Unknown Tutor"}
                          </p>
                          {/* Stats row */}
                          <div className="flex items-center gap-3 text-xs text-secondary-text flex-wrap">
                            {course.averageRating !== null &&
                              course.averageRating > 0 && (
                                <span className="flex items-center gap-1 text-yellow-500 font-semibold">
                                  ⭐ {course.averageRating.toFixed(1)}
                                </span>
                              )}
                            {course.enrollmentCount > 0 && (
                              <span className="flex items-center gap-1">
                                👥 {course.enrollmentCount.toLocaleString()} enrolled
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Skills Summary */}
          <SkillSummaryWidget skills={skillsList} />
          {/* Upcoming Sessions */}
          <div className="bg-surface border border-border rounded-4xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-primary-text flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand" />
                Upcoming Sessions
              </h2>
            </div>

            <div className="space-y-6">
              {UPCOMING_SESSIONS.map((session) => (
                <div
                  key={session.id}
                  className="flex gap-4 group cursor-pointer"
                >
                  <div
                    className={`w-12 h-14 rounded-2xl border-2 ${session.color} flex flex-col items-center justify-center shrink-0 bg-surface`}
                  >
                    <span className="text-[10px] font-bold uppercase opacity-80">
                      {session.date.day}
                    </span>
                    <span className={`text-lg font-black leading-none`}>
                      {session.date.date}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-primary-text group-hover:text-brand transition-colors">
                      {session.title}
                    </h4>
                    <p className="text-xs text-secondary-text font-medium mb-1">
                      {session.type}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-green-600 font-bold">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      {session.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <button className="w-full py-3 border border-border rounded-xl font-bold text-sm text-primary-text hover:bg-surface-muted transition-colors">
                View Full Calendar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONCIERGE MODAL HERE */}
      <DashboardAiChatModal />
    </div>
  );
}
