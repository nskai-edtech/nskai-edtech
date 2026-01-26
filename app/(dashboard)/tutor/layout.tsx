import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sessionClaims } = await auth();

  // Get metadata from Clerk session
  const status = sessionClaims?.metadata?.status as string;

  // IF PENDING: Show the blocking screen
  if (status === "PENDING") {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-yellow-50 dark:bg-yellow-950/20 text-center p-6">
        <div className="bg-surface p-8 rounded-xl shadow-lg max-w-md border dark:border-gray-700">
          <h1 className="text-2xl font-bold text-yellow-600 dark:text-yellow-500 mb-4">
            Application Under Review
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Thank you for applying to be a Tutor. The Organization is currently
            reviewing your profile.
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-3 rounded mb-6">
            Status:{" "}
            <span className="font-semibold text-yellow-600 dark:text-yellow-500">
              PENDING APPROVAL
            </span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Please refresh this page later to check your status.
          </p>
          <Link
            href="/"
            className="block mt-4 text-blue-600 dark:text-blue-400 underline text-sm"
          >
            Go back to Home
          </Link>
        </div>
      </div>
    );
  }

  // IF ACTIVE: Show the actual dashboard
  return (
    <div>
      {/* (Sidebar would go here) */}
      {children}
    </div>
  );
}
