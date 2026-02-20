/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getTutorsWithCourseCount } from "@/actions/admin";
import { getTutorRatingStats } from "@/actions/reviews";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  BadgeCheck,
  BookOpen,
  Clock,
  MoreVertical,
  Star,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function TutorsPage() {
  const { sessionClaims } = await auth();

  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    redirect("/");
  }

  const tutors = await getTutorsWithCourseCount();

  // Filter to only show ACTIVE tutors on this page (the public-facing tutors view)
  const activeTutors = tutors.filter((t) => t.status === "ACTIVE");

  const activeTutorsWithStats = await Promise.all(
    activeTutors.map(async (tutor) => {
      const stats = await getTutorRatingStats(tutor.id);
      return {
        ...tutor,
        avgRating: stats.avgRating,
        totalReviews: stats.totalReviews,
      };
    }),
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-text flex items-center gap-3">
            <Users className="w-8 h-8 text-brand" />
            Our Tutors
          </h1>
          <p className="text-secondary-text mt-2 max-w-2xl">
            Meet our world-class educators. Each tutor is verified and brings
            extensive expertise to help your students succeed.
          </p>
        </div>
        <div>
          <button className="px-6 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-xl font-medium transition-colors shadow-lg shadow-brand/20 flex items-center gap-2">
            <span>Invite New Tutor</span>
          </button>
        </div>
      </div>

      {/* Tutors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTutorsWithStats.map((tutor) => (
          <div
            key={tutor.id}
            className="group relative bg-surface border border-border rounded-2xl p-6 hover:shadow-xl hover:border-brand/30 transition-all duration-300 flex flex-col"
          >
            {/* Action Menu */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 hover:bg-surface-muted rounded-full">
                <MoreVertical className="w-4 h-4 text-secondary-text" />
              </button>
            </div>

            {/* Profile Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-surface-muted border-2 border-white dark:border-gray-800 shadow-sm">
                  <Image
                    src={
                      tutor.imageUrl ||
                      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150&h=150&fit=crop&crop=face"
                    }
                    alt={`${tutor.firstName} ${tutor.lastName}`}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
                {/* Show badge for active tutors */}
                <div className="absolute -bottom-2 -right-2 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800 flex items-center gap-0.5 shadow-sm">
                  <BadgeCheck className="w-3 h-3" />
                  ACTIVE
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg text-primary-text group-hover:text-brand transition-colors">
                  {tutor.firstName} {tutor.lastName}
                </h3>
                <p className="text-sm text-brand font-medium">
                  {tutor.expertise || "Educator"}
                </p>
                <div className="flex items-center gap-1 mt-1 text-sm text-secondary-text">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-primary-text">
                    {tutor.avgRating > 0 ? tutor.avgRating.toFixed(1) : "New"}
                  </span>
                  <span className="text-xs">({tutor.totalReviews})</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <p className="text-sm text-secondary-text mb-6 line-clamp-2 grow">
              {tutor.bio ||
                "Passionate educator ready to help students succeed."}
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-border mb-6 bg-surface-muted/30 -mx-6 px-6">
              <div className="flex flex-col">
                <span className="text-xs text-secondary-text uppercase tracking-wider font-semibold">
                  Courses
                </span>
                <div className="flex items-center gap-1.5 font-semibold text-primary-text mt-0.5">
                  <BookOpen className="w-4 h-4 text-brand" />
                  {tutor.courseCount} Active
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-secondary-text uppercase tracking-wider font-semibold">
                  Availability
                </span>
                <div className="flex items-center gap-1.5 font-semibold text-green-600 dark:text-green-400 mt-0.5">
                  <Clock className="w-4 h-4" />
                  Available
                </div>
              </div>
            </div>

            {/* Tags & Footer */}
            <div className="mt-auto">
              <div className="flex flex-wrap gap-2 mb-4">
                {tutor.expertise && (
                  <span className="px-2.5 py-1 rounded-md bg-surface-muted text-xs font-medium text-secondary-text">
                    {tutor.expertise}
                  </span>
                )}
              </div>

              <Link
                href={`/org/tutors/${tutor.id}`}
                className="w-full py-2.5 rounded-xl border border-border hover:border-brand hover:text-brand text-sm font-semibold text-primary-text transition-all duration-200 bg-transparent hover:bg-brand/5 block text-center"
              >
                View Profile
              </Link>
            </div>
          </div>
        ))}

        {/* Add New Card (Dotted) */}
        <button className="group flex flex-col items-center justify-center gap-4 p-6 border-2 border-dashed border-border rounded-2xl hover:border-brand/50 hover:bg-surface-muted/50 transition-all duration-300 min-h-[350px]">
          <div className="w-16 h-16 rounded-full bg-surface-muted group-hover:bg-brand/10 flex items-center justify-center transition-colors">
            <Users className="w-8 h-8 text-secondary-text group-hover:text-brand" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-lg text-primary-text mb-1">
              Invite a Tutor
            </h3>
            <p className="text-sm text-secondary-text max-w-[200px]">
              Add a new instructor to your organization&apos;s roster.
            </p>
          </div>
        </button>
      </div>

      {/* Empty State */}
      {activeTutorsWithStats.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-secondary-text mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-primary-text mb-2">
            No Active Tutors Yet
          </h3>
          <p className="text-secondary-text max-w-md mx-auto">
            Your organization doesn&apos;t have any active tutors. Approve
            pending tutors from the dashboard or invite new ones.
          </p>
        </div>
      )}
    </div>
  );
}
