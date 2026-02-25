"use client";

import { useState, useEffect } from "react";
import {
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import toast from "react-hot-toast";

import {
  approveCourseRequest,
  rejectCourseRequest,
} from "@/actions/requests/actions";

interface RequestData {
  id: string;
  type: "DRAFT" | "DELETE";
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: Date;
  resolvedAt: Date | null;
  course: {
    id: string;
    title: string;
    status: string;
  };
  tutor: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    imageUrl: string | null;
  };
}

interface RequestsTableProps {
  initialData: RequestData[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  searchQuery?: string;
}

export default function RequestsTable({
  initialData,
  totalCount,
  totalPages,
  currentPage,
  searchQuery = "",
}: RequestsTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    setIsSearching(true);
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setIsSearching(false);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Update URL on search change
  useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      const params = new URLSearchParams(window.location.search);
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      } else {
        params.delete("search");
      }
      params.set("page", "1"); // Reset to page 1 on new search
      router.push(`?${params.toString()}`);
    }
  }, [debouncedSearch, router, searchQuery]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleAction = async (
    request: RequestData,
    action: "APPROVE" | "REJECT",
  ) => {
    if (
      action === "APPROVE" &&
      request.type === "DELETE" &&
      !window.confirm(
        "Are you sure? Approving this will permanently delete the course.",
      )
    ) {
      return;
    }

    setProcessingId(request.id);
    try {
      const result =
        action === "APPROVE"
          ? await approveCourseRequest(request.id)
          : await rejectCourseRequest(request.id);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Request ${action.toLowerCase()}d successfully`);
        router.refresh(); // Refresh data from server
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setProcessingId(null);
    }
  };

  const pendingRequests = initialData.filter((r) => r.status === "PENDING");
  const pastRequests = initialData.filter((r) => r.status !== "PENDING");

  const RequestRow = ({ request }: { request: RequestData }) => {
    const isPending = request.status === "PENDING";
    return (
      <div className="p-4 sm:p-6 hover:bg-surface-muted transition-colors">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      request.type === "DRAFT"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-500"
                        : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-500"
                    }`}
                  >
                    {request.type === "DRAFT"
                      ? "Return to Draft"
                      : "Delete Course"}
                  </span>
                  <span
                    className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
                      request.status === "PENDING"
                        ? "border-amber-500/20 text-amber-500"
                        : request.status === "APPROVED"
                          ? "border-green-500/20 text-green-500"
                          : "border-red-500/20 text-red-500"
                    }`}
                  >
                    {request.status}
                  </span>
                  <span className="text-xs text-secondary-text">
                    {format(new Date(request.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-primary-text flex items-center gap-2">
                  {request.course.title}
                </h3>
              </div>
            </div>

            <div className="p-4 bg-background border border-border rounded-lg shadow-inner">
              <h4 className="text-xs font-bold text-secondary-text uppercase tracking-wider mb-2">
                Tutor&apos;s Reason
              </h4>
              <p className="text-sm text-primary-text whitespace-pre-wrap leading-relaxed">
                {request.reason}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-full border border-border">
                {request.tutor.imageUrl ? (
                  <Image
                    src={request.tutor.imageUrl}
                    alt="Tutor"
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-brand/10 flex items-center justify-center">
                    <UserIcon className="w-3 h-3 text-brand" />
                  </div>
                )}
                <span className="text-sm font-medium text-primary-text">
                  {request.tutor.firstName} {request.tutor.lastName}
                </span>
              </div>
              <span className="text-sm text-secondary-text">
                {request.tutor.email}
              </span>
            </div>
          </div>

          <div className="flex flex-row lg:flex-col justify-end gap-3 min-w-[140px]">
            {isPending ? (
              <>
                <button
                  onClick={() => handleAction(request, "APPROVE")}
                  disabled={processingId === request.id}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {processingId === request.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleAction(request, "REJECT")}
                  disabled={processingId === request.id}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-surface hover:bg-red-50 text-red-600 border border-border hover:border-red-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </>
            ) : (
              <div className="text-sm text-secondary-text mt-auto text-right w-full pb-2">
                Resolved on{" "}
                {request.resolvedAt
                  ? format(new Date(request.resolvedAt), "MMM d, yyyy")
                  : "Unknown"}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* SEARCH BAR */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-text" />
        <input
          type="text"
          placeholder="Search requests by course title or tutor name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-12 py-3 bg-surface border border-border rounded-xl text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand/50 transition-shadow"
        />
        {isSearching && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand animate-spin" />
        )}
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
        {initialData.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-secondary-text" />
            </div>
            <h3 className="text-lg font-bold text-primary-text mb-2">
              No Requests Found
            </h3>
            <p className="text-secondary-text max-w-sm mx-auto">
              {searchQuery
                ? `No requests match "${searchQuery}".`
                : "You're all caught up! There are currently no pending course requests."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {pendingRequests.length > 0 && (
              <div className="bg-brand/5 px-6 py-3 border-b border-border">
                <h3 className="text-sm font-bold text-brand uppercase tracking-wider">
                  Needs Attention
                </h3>
              </div>
            )}
            {pendingRequests.map((request) => (
              <RequestRow key={request.id} request={request} />
            ))}

            {pastRequests.length > 0 && (
              <div className="bg-surface-muted px-6 py-3 border-b border-border">
                <h3 className="text-sm font-bold text-secondary-text uppercase tracking-wider">
                  Past Requests
                </h3>
              </div>
            )}
            {pastRequests.map((request) => (
              <RequestRow key={request.id} request={request} />
            ))}
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl">
          <p className="text-sm text-secondary-text">
            Showing{" "}
            <span className="font-bold text-primary-text">
              {Math.min((currentPage - 1) * 20 + 1, totalCount)}
            </span>{" "}
            to{" "}
            <span className="font-bold text-primary-text">
              {Math.min(currentPage * 20, totalCount)}
            </span>{" "}
            of <span className="font-bold text-primary-text">{totalCount}</span>{" "}
            requests
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-border rounded-lg text-primary-text hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2)
                  pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? "bg-brand text-white"
                        : "hover:bg-surface-muted text-primary-text"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border border-border rounded-lg text-primary-text hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
