/* eslint-disable @typescript-eslint/ban-ts-comment */
import { getTutors } from "@/actions/admin";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { BadgeCheck, Clock, Shield } from "lucide-react";
import { TutorActionCell } from "./_components/tutor-action-cell";

export default async function OrgDashboard() {
  const { sessionClaims } = await auth();

  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    redirect("/");
  }

  const tutors = await getTutors();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-primary-text">
          <Shield className="w-8 h-8 text-blue-600 dark:text-blue-500" />
          Organization Dashboard
        </h1>
        <p className="text-secondary-text mt-2">
          Manage your tutors and platform requests.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold text-secondary-text">
                Tutor Name
              </th>
              <th className="px-6 py-4 font-semibold text-secondary-text">
                Expertise
              </th>
              <th className="px-6 py-4 font-semibold text-secondary-text">
                Status
              </th>
              <th className="px-6 py-4 font-semibold text-secondary-text text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tutors.map((tutor) => (
              <tr
                key={tutor.id}
                className="hover:bg-surface-muted transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-primary-text">
                    {tutor.firstName} {tutor.lastName}
                  </div>
                  <div className="text-xs text-secondary-text">
                    {tutor.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    {tutor.expertise}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {tutor.status === "ACTIVE" ? (
                    <span className="flex items-center text-green-600 dark:text-green-400 font-medium text-xs gap-1">
                      <BadgeCheck className="w-4 h-4" /> Active
                    </span>
                  ) : (
                    <span className="flex items-center text-amber-600 dark:text-amber-500 font-medium text-xs gap-1">
                      <Clock className="w-4 h-4" /> Pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {/* We extract the button to a client component so we can use hooks */}
                  <TutorActionCell tutorId={tutor.id} status={tutor.status} />
                </td>
              </tr>
            ))}

            {tutors.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-secondary-text"
                >
                  No tutors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
