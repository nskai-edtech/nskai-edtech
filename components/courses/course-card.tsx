"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, User } from "lucide-react";
import { CourseWithTutor } from "@/actions/courses";

interface CourseCardProps {
  course: CourseWithTutor;
  href: string;
}

export const CourseCard = ({ course, href }: CourseCardProps) => {
  const formattedPrice = course.price
    ? new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(course.price / 100)
    : "Free";

  return (
    <Link href={href} className="group">
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
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-5">
          <div className="flex items-center gap-1 mb-2 text-xs font-medium uppercase tracking-wider text-brand">
            {/* Category could go here if available */}
            Course
          </div>

          <h3 className="mb-2 text-lg font-bold leading-tight transition-colors line-clamp-2 text-primary-text group-hover:text-brand">
            {course.title}
          </h3>

          <p className="mb-4 text-sm line-clamp-2 text-secondary-text">
            {course.description || "No description provided."}
          </p>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
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
        </div>
      </div>
    </Link>
  );
};
