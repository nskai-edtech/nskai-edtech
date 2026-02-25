import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema/users";
import { eq } from "drizzle-orm";
import {
  getLearnerStats,
  getPurchasedCourses,
} from "@/actions/portfolio/queries";
import { Wallet, Clock, BookOpen, ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function LearnerPortfolioPage() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return redirect("/sign-in");
  }

  // Fetch user id
  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
    columns: { id: true },
  });

  if (!dbUser) {
    return redirect("/");
  }

  const userId = dbUser.id;

  // Await stats and purchased courses concurrently
  const [stats, coursesList] = await Promise.all([
    getLearnerStats(userId),
    getPurchasedCourses(userId),
  ]);

  // Transform Watch Time
  const watchSeconds = stats.totalWatchSeconds ?? 0;
  const watchHours = Math.floor(watchSeconds / 3600);
  const watchMinutes = Math.floor((watchSeconds % 3600) / 60);
  const formattedWatchTime = `${watchHours} hours and ${watchMinutes} minutes`;

  // Transform Spent Amount (Divide by 100 if stored in kobo/cents)
  const spentValue = stats.totalSpent ?? 0;
  const formattedSpent = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(spentValue / 100);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-surface text-primary-text min-h-screen">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
        <p className="text-secondary-text">
          View your high-level statistics and purchased courses.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-surface-muted p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 text-primary-text">
            <h3 className="tracking-tight text-sm font-medium">Total Spent</h3>
            <Wallet className="h-4 w-4 text-secondary-text" />
          </div>
          <div className="text-2xl font-bold text-primary-text">
            {formattedSpent}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface-muted p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 text-primary-text">
            <h3 className="tracking-tight text-sm font-medium">
              Total Watch Time
            </h3>
            <Clock className="h-4 w-4 text-secondary-text" />
          </div>
          <div className="text-2xl font-bold text-primary-text">
            {formattedWatchTime}
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-4 text-primary-text">
          <BookOpen className="h-5 w-5" />
          <h2 className="text-xl font-semibold tracking-tight">
            Purchased Courses
          </h2>
        </div>

        {coursesList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 lg:p-24 border border-dashed border-border rounded-lg bg-surface-muted text-center space-y-4">
            <p className="text-secondary-text font-medium text-lg">
              You haven&apos;t purchased any courses yet.
            </p>
            <Link
              href="/learner/marketplace"
              className="inline-flex h-10 items-center justify-center rounded-md bg-brand px-8 text-sm font-medium text-white shadow transition-colors hover:bg-brand/90"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursesList.map((course) => {
              const formattedPrice =
                course.price !== null
                  ? new Intl.NumberFormat("en-NG", {
                      style: "currency",
                      currency: "NGN",
                    }).format((course.price ?? 0) / 100)
                  : "Free";

              return (
                <div
                  key={course.id}
                  className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden flex flex-col h-full group hover:shadow-md transition-shadow"
                >
                  <div className="relative w-full aspect-video bg-surface-muted border-b border-border">
                    {course.imageUrl ? (
                      <Image
                        src={course.imageUrl}
                        alt={course.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-secondary-text bg-surface-muted">
                        <ImageIcon className="h-10 w-10 opacity-50" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 grow flex flex-col">
                    <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-primary-text">
                      {course.title}
                    </h3>
                    <p className="text-sm text-secondary-text mt-2">
                      {course.tutorName
                        ? `By ${course.tutorName}`
                        : "Instructor not specified"}
                    </p>
                    <p className="font-bold text-brand mt-1">
                      {formattedPrice}
                    </p>
                  </div>
                  <div className="px-6 pb-6 pt-0 mt-auto">
                    <p className="text-sm text-secondary-text font-medium">
                      Purchased on{" "}
                      {new Date(course.purchaseDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
