import { Suspense } from "react";
import { getWishlistCourses } from "@/actions/wishlist";
import { CourseCard } from "@/components/courses/course-card";
import { Heart, Loader2 } from "lucide-react";
import Link from "next/link";

export default function WishlistPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-primary-text flex items-center gap-3">
          <Heart className="w-8 h-8 text-brand" />
          Your Wishlist
        </h1>
        <p className="text-secondary-text mt-2 font-medium">
          Courses you have saved for later
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-brand" />
          </div>
        }
      >
        <WishlistContent />
      </Suspense>
    </div>
  );
}

async function WishlistContent() {
  const courses = await getWishlistCourses();

  if (courses.length === 0) {
    return (
      <div className="bg-surface border border-border border-dashed rounded-3xl p-16 text-center text-secondary-text flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <Heart className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-primary-text mb-2">
          Your wishlist is empty
        </h2>
        <p className="mb-8 max-w-sm mx-auto">
          Browse the marketplace to discover courses and save them here for
          later.
        </p>
        <Link
          href="/learner/marketplace"
          className="text-white font-bold text-sm bg-brand hover:bg-brand-dark px-8 py-3 rounded-full transition-colors"
        >
          Explore Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          href={`/learner/marketplace/${course.id}`}
        />
      ))}
    </div>
  );
}
