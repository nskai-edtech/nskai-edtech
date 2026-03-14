"use client";

import { useUser } from "@clerk/nextjs";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

export default function PendingApprovalPage() {
  const { user } = useUser();

  const meta = user?.publicMetadata as Record<string, string> | undefined;
  const schoolName = meta?.schoolName || "your school";
  const primaryColor = meta?.primaryColor || "#3b82f6";
  const status = meta?.status as string || "PENDING";

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 p-4 dark:bg-zinc-950">
      <div className="flex w-full max-w-md flex-col items-center justify-center space-y-6 rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
        
        {status === "ACTIVE" && (
          <>
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full text-white shadow-sm ring-4 ring-green-50 dark:ring-green-900/20 bg-green-500"
            >
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Application Approved
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You have been successfully permitted to use zerra for your school management.
              </p>
            </div>
            <Link
              href="/school-dashboard"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 dark:bg-white dark:text-zinc-900 dark:hover:bg-gray-100"
            >
              Go to Dashboard
            </Link>
          </>
        )}

        {status === "REJECTED" && (
          <>
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full text-white shadow-sm ring-4 ring-red-50 dark:ring-red-900/20 bg-red-500"
            >
              <XCircle className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Application Rejected
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Unfortunately, your school registration has been rejected. Please contact our support team for more information.
              </p>
            </div>
          </>
        )}

        {(status !== "ACTIVE" && status !== "REJECTED") && (
          <>
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold text-white shadow-sm ring-4 ring-gray-50 dark:ring-zinc-800"
              style={{ backgroundColor: primaryColor }}
            >
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Application Under Review
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your registration for <strong>{schoolName}</strong> has been
                received. Our team is currently reviewing your application. You will
                be notified once approved.
              </p>
            </div>

            <div className="mt-4 flex w-full flex-col gap-3">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full animate-pulse"
                  style={{ backgroundColor: primaryColor, width: "100%" }}
                />
              </div>
              <p className="text-xs font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                Pending Admin Approval
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
