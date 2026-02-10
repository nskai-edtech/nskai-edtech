/* eslint-disable @typescript-eslint/ban-ts-comment */
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Mail,
  Calendar,
  BookOpen,
  Eye,
} from "lucide-react";
import Image from "next/image";
import { getLearners } from "@/actions/admin";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LearnersPage({ searchParams }: PageProps) {
  const { sessionClaims } = await auth();

  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    redirect("/");
  }

  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const pageSize = 20;

  const { learners, totalCount, totalPages } = await getLearners(
    page,
    pageSize,
  );

  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, totalCount);

  const formatCurrency = (amountInKobo: number) => {
    return `₦${(amountInKobo / 100).toLocaleString()}`;
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary-text flex items-center gap-3">
              <Users className="w-8 h-8 text-brand" />
              Learners
            </h1>
            <p className="text-secondary-text mt-2">
              Manage and view all registered learners on the platform.
            </p>
          </div>
          <div className="bg-surface border border-border rounded-xl px-5 py-3">
            <span className="text-sm text-secondary-text">
              Total Learners:{" "}
            </span>
            <span className="text-lg font-bold text-primary-text">
              {totalCount}
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-x-scroll">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold text-secondary-text">
                Learner
              </th>
              <th className="px-6 py-4 font-semibold text-secondary-text">
                Status
              </th>
              <th className="px-6 py-4 font-semibold text-secondary-text">
                Courses Purchased
              </th>
              <th className="px-6 py-4 font-semibold text-secondary-text">
                Total Spent
              </th>
              <th className="px-6 py-4 font-semibold text-secondary-text">
                Joined
              </th>
              <th className="px-6 py-4 font-semibold text-secondary-text text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {learners.map((learner) => (
              <tr
                key={learner.id}
                className="hover:bg-surface-muted transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-muted border border-border overflow-hidden shrink-0">
                      {learner.imageUrl ? (
                        <Image
                          src={learner.imageUrl}
                          alt={`${learner.firstName} ${learner.lastName}`}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-secondary-text text-sm font-bold">
                          {learner.firstName?.[0]}
                          {learner.lastName?.[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-primary-text">
                        {learner.firstName} {learner.lastName}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-secondary-text">
                        <Mail className="w-3 h-3" />
                        {learner.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {learner.status === "ACTIVE" && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      Active
                    </span>
                  )}
                  {learner.status === "PENDING" && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                      Pending
                    </span>
                  )}
                  {learner.status === "SUSPENDED" && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                      Suspended
                    </span>
                  )}
                  {learner.status === "BANNED" && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                      Banned
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-primary-text font-medium">
                    <BookOpen className="w-4 h-4 text-brand" />
                    {learner.coursesPurchased}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-primary-text">
                    {formatCurrency(learner.totalSpent)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-sm text-secondary-text">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(learner.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/org/learners/${learner.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:border-brand hover:text-brand text-secondary-text text-xs font-medium transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Profile
                  </Link>
                </td>
              </tr>
            ))}

            {learners.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-secondary-text"
                >
                  No learners found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border border-border rounded-xl px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-surface">
          <div className="text-sm text-secondary-text">
            Showing{" "}
            <span className="font-bold text-primary-text">{start + 1}</span> to{" "}
            <span className="font-bold text-primary-text">{end}</span> of{" "}
            <span className="font-bold text-primary-text">{totalCount}</span>{" "}
            learners
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={page > 1 ? `/org/learners?page=${page - 1}` : "#"}
              className={`p-2 rounded-lg border border-border transition-colors ${
                page > 1
                  ? "bg-surface hover:bg-surface-muted text-primary-text"
                  : "bg-surface-muted text-secondary-text cursor-not-allowed opacity-50"
              }`}
              aria-disabled={page <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-1.5 px-2">
              <span className="text-sm font-medium text-primary-text">
                Page {page}
              </span>
              <span className="text-sm text-secondary-text">
                of {totalPages}
              </span>
            </div>

            <Link
              href={page < totalPages ? `/org/learners?page=${page + 1}` : "#"}
              className={`p-2 rounded-lg border border-border transition-colors ${
                page < totalPages
                  ? "bg-surface hover:bg-surface-muted text-primary-text"
                  : "bg-surface-muted text-secondary-text cursor-not-allowed opacity-50"
              }`}
              aria-disabled={page >= totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
