import Link from "next/link";
import { ArrowRight, Calendar, ChevronRight, Sparkles } from "lucide-react";
import { getEnrolledCourses, getMarketplaceCourses } from "@/actions/courses";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";

// Mock Data Types (to be replaced with real backend data later)
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
  const enrolledCourses = await getEnrolledCourses();
  const { courses: recommendedCourses } = await getMarketplaceCourses(1, 3); // Fetch 3 top courses

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary-text flex items-center gap-3">
            Welcome back, {user?.firstName || "Learner"}!{" "}
            <span className="text-4xl">👋</span>
          </h1>
          <p className="text-secondary-text mt-2 text-lg">
            You&apos;re crushing it! 5-day streak and counting.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="flex gap-4">
          <div className="bg-surface border border-border rounded-3xl p-4 min-w-[120px] flex flex-col items-center justify-center shadow-sm">
            <span className="text-2xl mb-1">🔥</span>
            <span className="font-extrabold text-xl text-primary-text">
              5 Days
            </span>
            <span className="text-xs font-bold text-secondary-text tracking-wider uppercase">
              Streak
            </span>
          </div>
          <div className="bg-surface border border-border rounded-3xl p-4 min-w-[120px] flex flex-col items-center justify-center shadow-sm">
            <span className="text-2xl mb-1 text-yellow-400">⭐</span>
            <span className="font-extrabold text-xl text-primary-text">
              1,250
            </span>
            <span className="text-xs font-bold text-secondary-text tracking-wider uppercase">
              Points
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Courses */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary-text">
              My Active Courses
            </h2>
            <Link
              href="/learner/enrolled"
              className="text-brand font-semibold text-sm hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {enrolledCourses.length > 0 ? (
              enrolledCourses.slice(0, 2).map((course) => (
                <div
                  key={course.id}
                  className="bg-surface border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                  {/* Icon/Image Placeholder */}
                  <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6" />
                  </div>

                  {/* Progress Circle (Simulated) */}
                  <div className="absolute top-6 right-6">
                    <div className="relative w-12 h-12 rounded-full border-4 border-surface-muted flex items-center justify-center text-xs font-bold text-primary-text">
                      <span
                        className="absolute inset-0 rounded-full border-4 border-brand border-t-transparent animate-[spin_1s_ease-out_reverse]"
                        style={{ transform: "rotate(-45deg)" }}
                      ></span>
                      75%
                    </div>
                  </div>

                  <h3 className="font-bold text-lg text-primary-text mb-2 line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-sm text-secondary-text mb-6">
                    Last accessed: 2 hours ago
                  </p>

                  <Link
                    href={`/watch/${course.id}`}
                    className="w-full block text-center bg-brand text-white font-bold py-3 rounded-xl hover:bg-brand-dark transition-colors"
                  >
                    Continue Learning
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-12 text-center bg-surface-muted/50 rounded-3xl border border-dashed border-border">
                <p className="text-secondary-text mb-4">
                  No active courses yet.
                </p>
                <Link
                  href="/learner/marketplace"
                  className="text-brand font-bold hover:underline"
                >
                  Start a course
                </Link>
              </div>
            )}
          </div>

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

            <div className="grid md:grid-cols-2 gap-6">
              {recommendedCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/learner/marketplace/${course.id}`}
                  className="block group"
                >
                  <div className="bg-surface rounded-3xl p-4 border border-border hover:-translate-y-1 transition-transform">
                    <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 bg-gray-100">
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
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-md">
                        New
                      </span>
                      <span className="text-xs font-bold text-brand">
                        98% Match
                      </span>
                    </div>
                    <h3 className="font-bold text-primary-text text-lg leading-snug mb-1 group-hover:text-brand transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-secondary-text">
                      {course.tutor?.firstName || "Unknown Tutor"} • 12 hours
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Upcoming Sessions */}
          <div className="bg-surface border border-border rounded-[32px] p-6 shadow-sm">
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

          {/* Ask EduAI Widget */}
          <div className="bg-blue-600 rounded-[32px] p-6 text-white relative overflow-hidden shadow-2xl shadow-blue-600/20">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>

              <h3 className="text-xl font-black mb-2">Ask EduAI</h3>
              <p className="text-blue-100 text-sm leading-relaxed mb-6 font-medium">
                Stuck on a lesson? Ask me to explain a concept, summarize a
                video, or help with your code.
              </p>

              <div className="space-y-3 mb-6">
                <button className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-medium transition-colors border border-white/5">
                  &quot;Summarize my last lesson in AI Ethics&quot;
                </button>
                <button className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-medium transition-colors border border-white/5">
                  &quot;What&apos;s my next deadline?&quot;
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Type a question..."
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-white text-blue-900 placeholder:text-blue-300 text-sm font-bold focus:outline-none shadow-lg"
                />
                <button className="absolute right-2 top-2 p-1 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
