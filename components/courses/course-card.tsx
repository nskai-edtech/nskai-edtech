"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, User } from "lucide-react";
import { CourseWithTutor } from "@/actions/courses";

interface CourseCardProps {
  course: CourseWithTutor & {
    progressPercentage?: number;
    completedLessons?: number;
    totalLessons?: number;
  };
  href: string;
}

export const CourseCard = ({ course, href }: CourseCardProps) => {
  const formattedPrice = course.price
    ? new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(course.price / 100)
    : "Free";

  const hasProgress =
    course.progressPercentage !== undefined && course.progressPercentage > 0;

  return (
    <div className="group relative h-full">
      <div className="flex flex-col h-full overflow-hidden transition-all duration-300 border rounded-2xl bg-surface border-border hover:shadow-xl hover:shadow-brand/5 hover:-translate-y-1">
        {/* Cover Image */}
        <div className="relative aspect-video overflow-hidden">
          {course.imageUrl ? (
            <Image
              src={course.imageUrl}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-surface-muted">
              <BookOpen className="w-12 h-12 text-secondary-text/20" />
            </div>
          )}

          {/* Badge for Price/Free */}
          <div className="absolute top-3 right-3 px-3 py-1 text-sm font-semibold rounded-full bg-black/60 backdrop-blur-md text-white border border-white/10">
            {formattedPrice}
          </div>

          {/* Progress Badge (if enrolled) */}
          {hasProgress && (
            <div className="absolute bottom-3 left-3 px-3 py-1 text-xs font-bold rounded-full bg-brand/90 backdrop-blur-md text-white border border-white/20">
              {course.progressPercentage}% Complete
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-5">
          <div className="flex items-center gap-1 mb-2 text-xs font-medium uppercase tracking-wider text-brand">
            {/* TODO: Category could go here */}
            Course
          </div>

          <h3 className="mb-2 text-lg font-bold leading-tight transition-colors line-clamp-2 text-primary-text group-hover:text-brand">
            {course.title}
          </h3>

          <p className="mb-4 text-sm line-clamp-2 text-secondary-text">
            {course.description || "No description provided."}
          </p>

          {/* Progress Bar (if enrolled) */}
          {hasProgress && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1 text-xs text-secondary-text">
                <span>Progress</span>
                <span>
                  {course.completedLessons}/{course.totalLessons} lessons
                </span>
              </div>
              <div className="w-full h-2 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full transition-all duration-500 bg-linear-to-r from-brand to-brand-dark"
                  style={{ width: `${course.progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 overflow-hidden rounded-full bg-surface-muted ring-2 ring-border">
                  {course.tutor?.imageUrl ? (
                    <Image
                      src={course.tutor.imageUrl}
                      alt={`${course.tutor.firstName} ${course.tutor.lastName}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <User className="w-4 h-4 text-secondary-text" />
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium text-primary-text truncate max-w-[120px]">
                  {course.tutor?.firstName} {course.tutor?.lastName}
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs text-secondary-text">
                <BookOpen className="w-4 h-4" />
                <span>Lessons</span>
              </div>
            </div>

            {/* Course Action */}
            <div className="mt-2 text-center w-full">
              <Link
                href={href}
                className="flex items-center justify-center w-full py-2.5 text-xs font-bold text-white transition-colors rounded-xl bg-brand hover:bg-brand-dark"
              >
                View Course
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
