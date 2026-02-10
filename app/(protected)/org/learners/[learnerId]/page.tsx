/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getLearnerById } from "@/actions/admin";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Mail,
  ShoppingBag,
  CreditCard,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface PageProps {
  params: Promise<{ learnerId: string }>;
}

export default async function LearnerProfilePage({ params }: PageProps) {
  const { learnerId } = await params;
  const { sessionClaims } = await auth();

  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    redirect("/");
  }

  const learner = await getLearnerById(learnerId);

  if (!learner) {
    notFound();
  }

  const formatCurrency = (amountInKobo: number) => {
    return `₦${(amountInKobo / 100).toLocaleString()}`;
  };

  const statusBadge = () => {
    switch (learner.status) {
      case "ACTIVE":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400">
            Active
          </span>
        );
      case "PENDING":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400">
            Pending
          </span>
        );
      case "SUSPENDED":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400">
            Suspended
          </span>
        );
      case "BANNED":
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400">
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
        href="/org/learners"
        className="inline-flex items-center gap-2 text-secondary-text hover:text-primary-text transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Learners</span>
      </Link>

      {/* Profile Header */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden mb-8">
        {/* Cover */}
        <div className="h-32 md:h-40 bg-linear-to-r from-blue-500/20 via-brand/10 to-transparent" />

        {/* Profile Info */}
        <div className="p-4 md:p-6 -mt-16 md:-mt-20">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-surface-muted border-4 border-surface shadow-lg flex items-center justify-center">
                {learner.imageUrl ? (
                  <Image
                    src={learner.imageUrl}
                    alt={`${learner.firstName} ${learner.lastName}`}
                    width={128}
                    height={128}
                    className="object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-secondary-text">
                    {learner.firstName?.[0]}
                    {learner.lastName?.[0]}
                  </span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-primary-text">
                      {learner.firstName} {learner.lastName}
                    </h1>
                    {statusBadge()}
                  </div>
                  <div className="flex items-center gap-2 text-secondary-text text-sm">
                    <Mail className="w-4 h-4" />
                    <span>{learner.email}</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex gap-6 md:gap-8">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <ShoppingBag className="w-5 h-5 text-brand" />
                      <span className="text-xl font-bold text-primary-text">
                        {learner.totalCourses}
                      </span>
                    </div>
                    <span className="text-xs text-secondary-text">Courses</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <CreditCard className="w-5 h-5 text-brand" />
                      <span className="text-xl font-bold text-primary-text">
                        {formatCurrency(learner.totalSpent)}
                      </span>
                    </div>
                    <span className="text-xs text-secondary-text">
                      Total Spent
                    </span>
                  </div>
                </div>
              </div>

              {/* Meta Info */}
              <div className="mt-6 pt-6 border-t border-border flex flex-wrap gap-6">
                <div className="flex items-center gap-2 text-sm text-secondary-text">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Joined{" "}
                    {new Date(learner.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {learner.learningGoal && (
                  <div className="flex items-center gap-2 text-sm text-secondary-text">
                    <span className="font-medium">Goal:</span>
                    <span>{learner.learningGoal}</span>
                  </div>
                )}
                {learner.interests && learner.interests.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {learner.interests.map((interest) => (
                      <span
                        key={interest}
                        className="px-2.5 py-1 rounded-full bg-brand/10 text-brand text-xs font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchased Courses */}
      <div>
        <h2 className="text-xl font-bold text-primary-text mb-2">
          Purchased Courses
        </h2>
        <p className="text-secondary-text mb-6">
          All courses this learner has enrolled in.
        </p>

        {learner.purchasedCourses.length > 0 ? (
          <div className="bg-surface border border-border rounded-xl shadow-sm overflow-x-scroll">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-muted border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-semibold text-secondary-text">
                    Course
                  </th>
                  <th className="px-6 py-4 font-semibold text-secondary-text">
                    Tutor
                  </th>
                  <th className="px-6 py-4 font-semibold text-secondary-text">
                    Amount Paid
                  </th>
                  <th className="px-6 py-4 font-semibold text-secondary-text">
                    Purchase Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {learner.purchasedCourses.map((purchase) => (
                  <tr
                    key={purchase.purchaseId}
                    className="hover:bg-surface-muted transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 rounded-md bg-surface-muted overflow-hidden shrink-0">
                          {purchase.courseImageUrl ? (
                            <Image
                              src={purchase.courseImageUrl}
                              alt={purchase.courseTitle}
                              width={48}
                              height={32}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-secondary-text" />
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-primary-text">
                          {purchase.courseTitle}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-secondary-text">
                      {purchase.tutorFirstName} {purchase.tutorLastName}
                    </td>
                    <td className="px-6 py-4 font-semibold text-primary-text">
                      {formatCurrency(purchase.purchaseAmount)}
                    </td>
                    <td className="px-6 py-4 text-secondary-text">
                      {new Date(purchase.purchasedAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-surface-muted/30 rounded-xl border border-dashed border-border">
            <ShoppingBag className="w-12 h-12 text-secondary-text mx-auto mb-3" />
            <h3 className="font-semibold text-primary-text mb-1">
              No Purchases Yet
            </h3>
            <p className="text-sm text-secondary-text">
              This learner hasn&apos;t purchased any courses.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
