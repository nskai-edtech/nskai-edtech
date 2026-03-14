"use client";

import { useState, useTransition } from "react";
import { approveSchool, rejectSchool } from "@/actions/school-approvals";
import { Check, X, MapPin, Building2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface PendingSchool {
  userId: string;
  userEmail: string;
  firstName: string | null;
  lastName: string | null;
  schoolId: string;
  schoolName: string;
  schoolType: string;
  logoUrl: string | null;
  primaryColor: string | null;
  ownerName: string;
  ownerEmail: string;
  createdAt: Date;
  country: string | null;
  state: string | null;
  lga: string | null;
}

export function SchoolApprovalsList({
  schools,
}: {
  schools: PendingSchool[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionTarget, setActionTarget] = useState<string | null>(null);

  const handleApprove = (schoolId: string) => {
    setActionTarget(schoolId);
    startTransition(async () => {
      const res = await approveSchool(schoolId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("School approved successfully. They now have access to their dashboard.");
      }
      setActionTarget(null);
      router.refresh();
    });
  };

  const handleReject = (schoolId: string) => {
    if (!confirm("Are you sure you want to reject this school registration?"))
      return;
    setActionTarget(schoolId);
    startTransition(async () => {
      const res = await rejectSchool(schoolId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("School registration rejected.");
      }
      setActionTarget(null);
      router.refresh();
    });
  };

  if (schools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Building2 className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">
          No Pending Schools
        </h3>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          All school registrations have been reviewed.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {schools.map((school) => (
        <div
          key={school.schoolId}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-surface border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow"
        >
          {/* School Avatar */}
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white"
            style={{
              backgroundColor: school.primaryColor || "#3b82f6",
            }}
          >
            {school.schoolName.charAt(0)}
          </div>

          {/* School Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold truncate">
              {school.schoolName}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {school.schoolType}
              </span>
              {school.country && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {school.lga}, {school.state}, {school.country}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered by{" "}
              <strong>
                {school.firstName} {school.lastName}
              </strong>{" "}
              ({school.userEmail}) •{" "}
              {new Date(school.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleApprove(school.schoolId)}
              disabled={isPending && actionTarget === school.schoolId}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isPending && actionTarget === school.schoolId ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Approve
            </button>
            <button
              onClick={() => handleReject(school.schoolId)}
              disabled={isPending && actionTarget === school.schoolId}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
