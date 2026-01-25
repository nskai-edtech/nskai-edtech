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
      <div className="h-screen flex flex-col items-center justify-center bg-yellow-50 text-center p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-yellow-600 mb-4">
            Application Under Review
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for applying to be a Tutor. The Organization is currently
            reviewing your profile.
          </p>
          <div className="text-sm text-gray-500 bg-gray-100 p-3 rounded mb-6">
            Status:{" "}
            <span className="font-semibold text-yellow-600">
              PENDING APPROVAL
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Please refresh this page later to check your status.
          </p>
          <Link href="/" className="block mt-4 text-blue-600 underline text-sm">
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
