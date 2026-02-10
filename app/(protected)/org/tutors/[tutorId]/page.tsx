/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getTutorById, getTutorCoursesForAdmin } from "@/actions/admin";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  Calendar,
  Mail,
  Users,
  Clock,
  ShieldAlert,
  Ban,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CourseTabs } from "./_components/course-tabs";

interface PageProps {
  params: Promise<{ tutorId: string }>;
}

export default async function TutorProfilePage({ params }: PageProps) {
  const { tutorId } = await params;
  const { sessionClaims } = await auth();

  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    redirect("/");
  }

  const tutor = await getTutorById(tutorId);
  const tutorCourses = await getTutorCoursesForAdmin(tutorId);

  if (!tutor) {
    notFound();
  }

  const getStatusBadge = () => {
    switch (tutor.status) {
      case "ACTIVE":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400">
            <BadgeCheck className="w-4 h-4" />
            Active
          </span>
        );
      case "PENDING":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400">
            <Clock className="w-4 h-4" />
            Pending Approval
          </span>
        );
      case "SUSPENDED":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400">
            <ShieldAlert className="w-4 h-4" />
            Suspended
          </span>
        );
      case "BANNED":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400">
            <Ban className="w-4 h-4" />
            Banned
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Back Button */}
      <Link
        href="/org/tutors"
        className="inline-flex items-center gap-2 text-secondary-text hover:text-primary-text transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Tutors</span>
      </Link>

      {/* Profile Header */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden mb-8">
        {/* Cover/Banner */}
        <div className="h-32 md:h-48 bg-linear-to-r from-brand/20 via-brand/10 to-transparent" />

        {/* Profile Info */}
        <div className="p-4 md:p-6 -mt-16 md:-mt-20">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-surface-muted border-4 border-surface shadow-lg">
                <Image
                  src={
                    tutor.imageUrl ||
                    "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=150&h=150&fit=crop&crop=face"
                  }
                  alt={`${tutor.firstName} ${tutor.lastName}`}
                  width={128}
                  height={128}
                  className="object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-primary-text">
                      {tutor.firstName} {tutor.lastName}
                    </h1>
                    {getStatusBadge()}
                  </div>
                  <p className="text-brand font-medium text-lg mb-2">
                    {tutor.expertise || "Educator"}
                  </p>
                  <div className="flex items-center gap-2 text-secondary-text text-sm">
                    <Mail className="w-4 h-4" />
                    <span>{tutor.email}</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex gap-6 md:gap-8">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="w-5 h-5 text-brand" />
                      <span className="text-xl font-bold text-primary-text">
                        {tutor.totalStudents}
                      </span>
                    </div>
                    <span className="text-xs text-secondary-text">
                      Students
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <BookOpen className="w-5 h-5 text-brand" />
                      <span className="text-xl font-bold text-primary-text">
                        {tutor.totalCourses}
                      </span>
                    </div>
                    <span className="text-xs text-secondary-text">Courses</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6 pt-6 border-t border-border">
            <h2 className="text-sm font-semibold text-secondary-text uppercase tracking-wider mb-2">
              About
            </h2>
            <p className="text-primary-text leading-relaxed">
              {tutor.bio || "This tutor hasn't added a bio yet."}
            </p>
          </div>

          {/* Meta Info */}
          <div className="mt-6 pt-6 border-t border-border flex flex-wrap gap-6">
            <div className="flex items-center gap-2 text-sm text-secondary-text">
              <Calendar className="w-4 h-4" />
              <span>
                Joined{" "}
                {new Date(tutor.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            {tutor.expertise && (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-brand/10 text-brand text-sm font-medium">
                  {tutor.expertise}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div>
        <h2 className="text-xl font-bold text-primary-text mb-2">Courses</h2>
        <p className="text-secondary-text mb-4">
          Manage courses created by this tutor.
        </p>
        <CourseTabs courses={tutorCourses} />
      </div>
    </div>
  );
}
