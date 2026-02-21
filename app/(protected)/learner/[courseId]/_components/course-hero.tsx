import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getCourseRatingStats } from "@/actions/reviews";
import { db } from "@/lib/db";
import { purchases } from "@/drizzle/schema";
import { eq, sql } from "drizzle-orm";

interface CourseHeroProps {
  courseId: string;
  courseTitle: string;
  courseDescription: string | null;
  hasCert: boolean;
  tutor: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  } | null;
}

export async function CourseHero({
  courseId,
  courseTitle,
  courseDescription,
  hasCert,
  tutor,
}: CourseHeroProps) {
  const courseRatingStats = await getCourseRatingStats(courseId);
  const [courseStudentsResult] = await db
    .select({ count: sql<number>`count(distinct ${purchases.userId})` })
    .from(purchases)
    .where(eq(purchases.courseId, courseId));
  const totalCourseStudents = Number(courseStudentsResult?.count || 0);

  return (
    <div>
      <div className="flex items-center gap-2 text-brand font-bold text-xs uppercase tracking-widest mb-4">
        <span className="bg-brand/10 px-3 py-1 rounded-full">Course</span>
        {hasCert && (
          <span className="bg-orange-500/10 text-orange-600 px-3 py-1 rounded-full border border-orange-500/20">
            Certification Available
          </span>
        )}
      </div>
      <h1 className="text-4xl md:text-5xl font-black text-primary-text leading-[1.15] mb-6">
        {courseTitle}
      </h1>
      <p className="text-xl text-secondary-text leading-relaxed max-w-3xl">
        {courseDescription}
      </p>

      <div className="flex flex-wrap items-center gap-6 mt-8">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-4 h-4 ${s <= Math.round(courseRatingStats.avgRating) ? "fill-orange-400 text-orange-400" : "fill-transparent text-muted-foreground"}`}
              />
            ))}
          </div>
          <span className="text-sm font-bold text-primary-text">
            {courseRatingStats.avgRating.toFixed(1)}
          </span>
          <span className="text-xs text-secondary-text font-medium">
            ({courseRatingStats.totalReviews.toLocaleString()}{" "}
            {courseRatingStats.totalReviews === 1 ? "review" : "reviews"})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border-2 border-surface bg-gray-100 flex items-center justify-center overflow-hidden"
              >
                <Image
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123 + courseId.charCodeAt(0)}`}
                  alt="student"
                  width={24}
                  height={24}
                />
              </div>
            ))}
          </div>
          <span className="text-xs text-secondary-text font-medium">
            <span className="text-primary-text font-bold">
              {totalCourseStudents.toLocaleString()}
            </span>{" "}
            students enrolled
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-8 pt-8 border-t border-border">
        <div className="relative w-12 h-12 rounded-full overflow-hidden border border-border">
          {tutor?.imageUrl ? (
            <Image
              src={tutor.imageUrl}
              alt={tutor.firstName || "Tutor"}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-brand/10 flex items-center justify-center text-brand font-bold">
              {tutor?.firstName?.[0]}
            </div>
          )}
        </div>
        <div>
          <p className="text-xs text-secondary-text font-semibold uppercase tracking-wider">
            Created by
          </p>
          <Link
            href={tutor ? `/learner/tutor/${tutor.id}` : "#"}
            className="text-base font-bold text-brand hover:underline cursor-pointer"
          >
            {tutor?.firstName} {tutor?.lastName}
          </Link>
        </div>
      </div>
    </div>
  );
}
