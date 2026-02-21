import { Star, Globe, GraduationCap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getTutorRatingStats } from "@/actions/reviews";
import { db } from "@/lib/db";
import { purchases, courses as schemaCourses } from "@/drizzle/schema";
import { eq, sql } from "drizzle-orm";

interface CourseInstructorProps {
  tutor: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
    bio: string | null;
  } | null;
}

export async function CourseInstructor({ tutor }: CourseInstructorProps) {
  if (!tutor) return null;

  const tutorRatingStats = await getTutorRatingStats(tutor.id);
  const [tutorStudentsResult] = await db
    .select({ count: sql<number>`count(distinct ${purchases.userId})` })
    .from(purchases)
    .innerJoin(schemaCourses, eq(purchases.courseId, schemaCourses.id))
    .where(eq(schemaCourses.tutorId, tutor.id));
  const totalTutorStudents = Number(tutorStudentsResult?.count || 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary-text flex items-center gap-3">
        <GraduationCap className="w-7 h-7 text-brand" />
        About the Instructor
      </h2>
      <div className="bg-surface border border-border rounded-3xl p-8 flex flex-col md:flex-row gap-8">
        <div className="relative w-32 h-32 rounded-3xl overflow-hidden shadow-xl border border-border shrink-0 bg-gray-100">
          {tutor.imageUrl ? (
            <Image
              src={tutor.imageUrl}
              alt={tutor.firstName || "Tutor"}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-brand/10 flex items-center justify-center text-3xl text-brand font-bold">
              {tutor.firstName?.[0]}
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-2xl font-bold text-brand">
              {tutor.firstName} {tutor.lastName}
            </h3>
            <p className="text-secondary-text font-medium italic mt-1">
              AI Research Lead & Principal Course Designer
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 py-2 border-y border-border/50">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
              <span className="text-sm font-bold text-primary-text">
                {tutorRatingStats.avgRating.toFixed(1)} Instructor Rating
              </span>
            </div>
            <div className="flex items-center gap-2 text-secondary-text">
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">
                {tutorRatingStats.totalReviews.toLocaleString()}{" "}
                {tutorRatingStats.totalReviews === 1 ? "Review" : "Reviews"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-secondary-text">
              <GraduationCap className="w-4 h-4" />
              <span className="text-sm font-medium">
                {totalTutorStudents.toLocaleString()} Students
              </span>
            </div>
          </div>
          <p className="text-secondary-text leading-relaxed">
            {tutor.bio ||
              `${tutor.firstName} brings over 15 years of industry experience to NSKAI-EdTech. Specializing in practical application, their courses focus on bridging the gap between complex technical concepts and real-world results.`}
          </p>
          <Link
            href={`/learner/tutor/${tutor.id}`}
            className="text-brand font-bold text-sm hover:underline flex items-center gap-1 transition-all"
          >
            View Full Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
