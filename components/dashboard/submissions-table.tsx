"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  CheckCircle,
  Clock,
  FileText,
  XCircle,
  Search,
  Mail,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { gradeSubmission } from "@/actions/assessments/actions";
import toast from "react-hot-toast";

type SubmissionRow = {
  id: string;
  status: "PENDING" | "GRADED" | "REJECTED";
  score: number | null;
  feedback: string | null;
  fileUrl: string;
  submittedAt: Date;
  gradedAt: Date | null;
  assignment: {
    id: string;
    title: string;
    maxScore: number;
  };
  course: {
    id: string;
    title: string;
  };
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    imageUrl: string | null;
  };
};

interface SubmissionsTableProps {
  initialSubmissions: SubmissionRow[];
}

export const SubmissionsTable = ({
  initialSubmissions,
}: SubmissionsTableProps) => {
  const [submissions, setSubmissions] =
    useState<SubmissionRow[]>(initialSubmissions);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "GRADED">(
    "ALL",
  );

  useEffect(() => {
    setIsSearching(true);
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setIsSearching(false);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionRow | null>(null);
  const [gradingScore, setGradingScore] = useState<number | "">("");
  const [gradingFeedback, setGradingFeedback] = useState("");
  const [isGrading, setIsGrading] = useState(false);

  /* PAGINATION STATES */
  const [currentPage, setCurrentPage] = useState(1);
  const [isPaginating, setIsPaginating] = useState(false);
  const ITEMS_PER_PAGE = 20;

  const filteredSubmissions = submissions.filter((sub) => {
    if (activeTab === "PENDING" && sub.status !== "PENDING") return false;
    if (activeTab === "GRADED" && sub.status !== "GRADED") return false;

    const query = debouncedSearch.toLowerCase();
    const studentName =
      `${sub.user.firstName || ""} ${sub.user.lastName || ""}`.toLowerCase();
    const courseTitle = sub.course.title.toLowerCase();
    const assignmentTitle = sub.assignment.title.toLowerCase();

    return (
      studentName.includes(query) ||
      courseTitle.includes(query) ||
      assignmentTitle.includes(query) ||
      (sub.user.email?.toLowerCase() || "").includes(query)
    );
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeTab]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSubmissions.length / ITEMS_PER_PAGE),
  );

  // Guard against out of bounds current page (e.g. going from tab with 3 pages to tab with 1 page)
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const currentSubmissions = filteredSubmissions.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE,
  );

  const handlePageChange = (page: number) => {
    setIsPaginating(true);
    setTimeout(() => {
      setCurrentPage(page);
      setIsPaginating(false);
    }, 400);
  };

  const handleGradeSubmit = async () => {
    if (!selectedSubmission) return;

    if (
      gradingScore === "" ||
      gradingScore < 0 ||
      gradingScore > selectedSubmission.assignment.maxScore
    ) {
      toast.error(
        `Score must be between 0 and ${selectedSubmission.assignment.maxScore}`,
      );
      return;
    }

    setIsGrading(true);
    try {
      const res = await gradeSubmission(
        selectedSubmission.id,
        Number(gradingScore),
        gradingFeedback,
      );
      if (res.error) {
        toast.error(res.error);
      } else if (res.submission) {
        toast.success("Submission graded successfully!");
        setSubmissions((current) =>
          current.map((s) =>
            s.id === selectedSubmission.id
              ? {
                  ...s,
                  status: "GRADED",
                  score: Number(gradingScore),
                  feedback: gradingFeedback,
                  gradedAt: new Date(),
                }
              : s,
          ),
        );
        setSelectedSubmission(null);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsGrading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission) return;

    setIsGrading(true);
    try {
      const res = await gradeSubmission(
        selectedSubmission.id,
        0,
        gradingFeedback ||
          "Submission rejected. Please review the instructions and try again.",
      );

      if (res.error) {
        toast.error(res.error);
      } else if (res.submission) {
        toast.success("Submission rejected");
        setSubmissions((current) =>
          current.map((s) =>
            s.id === selectedSubmission.id
              ? {
                  ...s,
                  status: "REJECTED",
                  score: 0,
                  feedback: gradingFeedback || "Submission rejected.",
                  gradedAt: new Date(),
                }
              : s,
          ),
        );
        setSelectedSubmission(null);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-surface p-4 rounded-xl border border-border">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text" />
          <input
            type="text"
            placeholder="Search student, course, or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand animate-spin" />
          )}
        </div>

        <div className="flex bg-background border border-border rounded-lg p-1 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === "ALL"
                ? "bg-surface text-primary-text shadow-sm"
                : "text-secondary-text hover:text-primary-text"
            }`}
          >
            All Submissions
          </button>
          <button
            onClick={() => setActiveTab("PENDING")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === "PENDING"
                ? "bg-surface text-primary-text shadow-sm"
                : "text-secondary-text hover:text-primary-text"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Needs Review
          </button>
          <button
            onClick={() => setActiveTab("GRADED")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === "GRADED"
                ? "bg-surface text-primary-text shadow-sm"
                : "text-secondary-text hover:text-primary-text"
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            Graded
          </button>
        </div>
      </div>
      {/* DATA TABLE */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted border-b border-border text-xs uppercase tracking-wider text-secondary-text">
                <th className="p-4 font-semibold">Student</th>
                <th className="p-4 font-semibold">Project & Course</th>
                <th className="p-4 font-semibold">Submitted</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isPaginating ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-16 text-center text-secondary-text"
                  >
                    <Loader2 className="w-8 h-8 animate-spin text-brand mx-auto mb-3" />
                    <p>Loading page...</p>
                  </td>
                </tr>
              ) : currentSubmissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-secondary-text"
                  >
                    <FileText className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p className="font-medium text-primary-text mb-1">
                      No submissions found
                    </p>
                    {debouncedSearch ? (
                      <p className="text-sm">
                        No student, course, or project matched &quot;
                        {debouncedSearch}&quot;
                      </p>
                    ) : (
                      <p className="text-sm">
                        There are no submissions to review.
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                currentSubmissions.map((sub) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-surface-muted/50 transition-colors"
                  >
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-3">
                        {sub.user.imageUrl ? (
                          <Image
                            src={sub.user.imageUrl}
                            alt={`${sub.user.firstName || "Student"}'s profile`}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover bg-surface-muted"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold">
                            {sub.user.firstName?.[0] ||
                              sub.user.email[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-primary-text text-sm">
                            {sub.user.firstName || sub.user.lastName
                              ? `${sub.user.firstName || ""} ${sub.user.lastName || ""}`
                              : "Unnamed Learner"}
                          </p>
                          <p className="text-xs text-secondary-text flex items-center gap-1">
                            {sub.user.email.substring(0, 20)}
                            {sub.user.email.length > 20 ? "..." : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <p className="font-bold text-primary-text text-sm mb-1">
                        {sub.assignment.title}
                      </p>
                      <p
                        className="text-xs text-secondary-text truncate max-w-[200px]"
                        title={sub.course.title}
                      >
                        {sub.course.title}
                      </p>
                    </td>
                    <td className="p-4 align-top">
                      <p className="text-sm font-medium text-primary-text">
                        {format(new Date(sub.submittedAt), "MMM d, yyyy")}
                      </p>
                      <p className="text-xs text-secondary-text">
                        {format(new Date(sub.submittedAt), "h:mm a")}
                      </p>
                    </td>
                    <td className="p-4 align-top">
                      {sub.status === "PENDING" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                      ) : sub.status === "GRADED" ? (
                        <div className="flex flex-col items-start gap-1">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-500 border border-green-500/20">
                            <CheckCircle className="w-3.5 h-3.5" /> Graded
                          </span>
                          <span className="text-xs font-bold font-mono text-primary-text">
                            {sub.score} / {sub.assignment.maxScore}
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20">
                          <XCircle className="w-3.5 h-3.5" /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="p-4 align-top text-right">
                      <button
                        onClick={() => {
                          setSelectedSubmission(sub);
                          setGradingScore(sub.score ?? "");
                          setGradingFeedback(sub.feedback ?? "");
                        }}
                        className="px-3 py-1.5 bg-brand/10 text-brand text-xs font-semibold rounded hover:bg-brand/20 transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* PAGINATION CONTROLS */}
      <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl">
        <p className="text-sm text-secondary-text">
          Showing{" "}
          <span className="font-bold text-primary-text">
            {filteredSubmissions.length === 0
              ? 0
              : (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}
          </span>{" "}
          to{" "}
          <span className="font-bold text-primary-text">
            {Math.min(
              safeCurrentPage * ITEMS_PER_PAGE,
              filteredSubmissions.length,
            )}
          </span>{" "}
          of{" "}
          <span className="font-bold text-primary-text">
            {filteredSubmissions.length}
          </span>{" "}
          submissions
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(Math.max(1, safeCurrentPage - 1))}
            disabled={safeCurrentPage === 1 || isPaginating}
            className="p-2 border border-border rounded-lg hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-primary-text" />
          </button>
          <span className="text-sm font-semibold text-primary-text px-2">
            {safeCurrentPage} / {totalPages}
          </span>
          <button
            onClick={() =>
              handlePageChange(Math.min(totalPages, safeCurrentPage + 1))
            }
            disabled={safeCurrentPage === totalPages || isPaginating}
            className="p-2 border border-border rounded-lg hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-primary-text" />
          </button>
        </div>
      </div>
      {/* GRADING MODAL */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border border-border animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-border flex items-center justify-between bg-surface-muted/50">
              <div>
                <h3 className="text-lg font-bold text-primary-text">
                  Review Submission
                </h3>
                <p className="text-sm text-secondary-text">
                  {selectedSubmission.assignment.title}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 text-secondary-text hover:text-primary-text hover:bg-border rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* STUDENT PROFILE HEADER */}
              <div className="flex items-center gap-4 p-4 bg-surface-muted rounded-xl mb-6">
                {selectedSubmission.user.imageUrl ? (
                  <Image
                    src={selectedSubmission.user.imageUrl}
                    alt={`${selectedSubmission.user.firstName || "Student"}'s profile`}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover border-2 border-surface"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-brand/20 text-brand flex items-center justify-center font-bold text-xl border-2 border-surface">
                    {selectedSubmission.user.firstName?.[0] ||
                      selectedSubmission.user.email[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-bold text-primary-text text-base">
                    {selectedSubmission.user.firstName ||
                    selectedSubmission.user.lastName
                      ? `${selectedSubmission.user.firstName || ""} ${selectedSubmission.user.lastName || ""}`
                      : "Unnamed Learner"}
                  </p>
                  <a
                    href={`mailto:${selectedSubmission.user.email}`}
                    className="text-sm text-brand hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <Mail className="w-3 h-3" /> {selectedSubmission.user.email}
                  </a>
                </div>
              </div>
              {/* SUBMITTED PROJECT FILE */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-primary-text mb-2">
                  Student&apos;s Project File
                </p>
                <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-background">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-brand/10 text-brand rounded-lg">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary-text truncate max-w-[250px] sm:max-w-xs">
                        {selectedSubmission.fileUrl.split("/").pop() ||
                          "project_file"}
                      </p>
                      <p className="text-xs text-secondary-text">
                        Submitted{" "}
                        {format(
                          new Date(selectedSubmission.submittedAt),
                          "MMM d, yyyy 'at' h:mm a",
                        )}
                      </p>
                    </div>
                  </div>
                  <a
                    href={selectedSubmission.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand/90 transition-colors shadow-sm whitespace-nowrap"
                  >
                    View File
                  </a>
                </div>
              </div>
              {/* GRADING FORM */}
              <div className="border-t border-border pt-6">
                <h4 className="text-base font-bold text-primary-text mb-4">
                  Grading & Feedback
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-text mb-1">
                      Score (out of {selectedSubmission.assignment.maxScore})
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={selectedSubmission.assignment.maxScore}
                      value={gradingScore}
                      onChange={(e) =>
                        setGradingScore(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      className="w-32 px-4 py-2 bg-background border border-border rounded-lg text-primary-text font-mono focus:outline-none focus:ring-2 focus:ring-brand/50"
                      placeholder="e.g. 85"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary-text mb-1">
                      Feedback / Comments (Optional)
                    </label>
                    <textarea
                      value={gradingFeedback}
                      onChange={(e) => setGradingFeedback(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg text-primary-text focus:outline-none focus:ring-2 focus:ring-brand/50 resize-y"
                      placeholder="Great job on..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border bg-surface flex items-center justify-between gap-3">
              <button
                onClick={handleReject}
                disabled={isGrading}
                className="px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                Reject Submission
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2 text-sm font-medium text-secondary-text hover:text-primary-text transition-colors"
                  disabled={isGrading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleGradeSubmit}
                  disabled={isGrading}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors shadow-md shadow-green-500/20"
                >
                  {isGrading ? "Saving..." : "Save Grade"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
