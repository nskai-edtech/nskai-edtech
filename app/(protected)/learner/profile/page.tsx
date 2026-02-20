import { getLearnerProfile, getLearnerStats } from "@/actions/profile";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import {
  BookOpen,
  CheckCircle,
  TrendingUp,
  Calendar,
  User,
} from "lucide-react";
import { ProfileForm } from "@/components/learner/profile-form";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const clerkUser = await currentUser();
  const profileResult = await getLearnerProfile();
  const statsResult = await getLearnerStats();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  if ("error" in profileResult) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-red-500">{profileResult.error}</p>
      </div>
    );
  }

  if ("error" in statsResult) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-red-500">{statsResult.error}</p>
      </div>
    );
  }

  const profile = profileResult;
  const stats = statsResult;

  // Format member since date
  const memberSince = stats.memberSince
    ? new Date(stats.memberSince).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Recently";

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="bg-surface border border-border rounded-3xl p-8">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-surface-muted shrink-0">
            {profile.imageUrl ? (
              <Image
                src={profile.imageUrl}
                alt={`${profile.firstName || "User"}'s avatar`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-12 h-12 text-secondary-text" />
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-black text-primary-text mb-2">
              {profile.firstName && profile.lastName
                ? `${profile.firstName} ${profile.lastName}`
                : profile.firstName || "Learner"}
            </h1>
            <p className="text-secondary-text mb-1">{profile.email}</p>
            <div className="flex items-center gap-2 text-sm text-secondary-text">
              <Calendar className="w-4 h-4" />
              <span>Member since {memberSince}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Statistics */}
      <div>
        <h2 className="text-xl font-bold text-primary-text mb-4">
          Learning Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Courses Enrolled */}
          <div className="bg-surface border border-border rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="text-3xl font-black text-primary-text mb-1">
              {stats.totalCoursesEnrolled}
            </div>
            <div className="text-xs font-bold text-secondary-text uppercase tracking-wider">
              Enrolled
            </div>
          </div>

          {/* Total Courses Completed */}
          <div className="bg-surface border border-border rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="text-3xl font-black text-primary-text mb-1">
              {stats.totalCoursesCompleted}
            </div>
            <div className="text-xs font-bold text-secondary-text uppercase tracking-wider">
              Completed
            </div>
          </div>

          {/* Total Lessons Completed */}
          <div className="bg-surface border border-border rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-3xl font-black text-primary-text mb-1">
              {stats.totalLessonsCompleted}
            </div>
            <div className="text-xs font-bold text-secondary-text uppercase tracking-wider">
              Lessons
            </div>
          </div>

          {/* Completion Rate */}
          <div className="bg-surface border border-border rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-black">
                {stats.completionRate}%
              </span>
            </div>
            <div className="text-3xl font-black text-primary-text mb-1">
              {stats.completionRate}%
            </div>
            <div className="text-xs font-bold text-secondary-text uppercase tracking-wider">
              Completion
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Section */}
      <div className="bg-surface border border-border rounded-3xl p-8">
        <h2 className="text-xl font-bold text-primary-text mb-6">
          Edit Profile
        </h2>
        <ProfileForm
          initialBio={profile.bio}
          initialInterests={profile.interests}
        />
      </div>
    </div>
  );
}
