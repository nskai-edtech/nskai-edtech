"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  BookOpen,
  Trash2,
  Archive,
  Users,
  DollarSign,
  Star,
  Heart,
  Trophy,
  GraduationCap,
  BrainCircuit,
  FileCheck,
  AlertTriangle,
  Loader2,
  TrendingUp,
  UserPlus,
  BarChart3,
  Clock,
  Award,
  UserIcon,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { formatPrice } from "@/lib/format";
import { RevenueChart } from "@/components/analytics/revenue-chart";
import {
  archiveCourse,
  permanentlyDeleteCourse,
  type CourseDeleteReviewData,
} from "@/actions/admin/course-delete-review";

// ─── KPI Card

function KpiCard({
  label,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      <p className="text-xs text-secondary-text uppercase tracking-wider font-semibold">
        {label}
      </p>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-2xl font-bold text-primary-text">{value}</span>
        <span className="text-xs text-secondary-text">{subtitle}</span>
      </div>
    </div>
  );
}

// ─── Bar Chart (inline)

function SimpleBarChart({
  data,
  title,
  subtitle,
  icon: Icon,
  barColor,
  formatValue,
}: {
  data: Array<{ month: string; value: number }>;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  barColor: string;
  formatValue: (val: number) => string;
}) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Icon className="w-4 h-4 text-secondary-text" />
            <h3 className="text-base font-semibold text-primary-text">
              {title}
            </h3>
          </div>
          <p className="text-sm text-secondary-text">{subtitle}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-primary-text">
            {formatValue(data.reduce((sum, d) => sum + d.value, 0))}
          </p>
          <p className="text-xs text-secondary-text">6-month total</p>
        </div>
      </div>
      <div className="flex items-end gap-3 h-36">
        {data.map((point, idx) => {
          const heightPercent = maxVal > 0 ? (point.value / maxVal) * 100 : 0;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-[10px] font-medium text-secondary-text tabular-nums">
                {point.value > 0 ? formatValue(point.value) : "–"}
              </span>
              <div className="w-full flex items-end h-24">
                <div
                  className={`w-full rounded-t-md transition-all ${barColor}`}
                  style={{
                    height: `${Math.max(heightPercent, 4)}%`,
                    minHeight: "3px",
                    opacity: point.value === 0 ? 0.2 : 1,
                  }}
                />
              </div>
              <span className="text-[11px] font-medium text-secondary-text">
                {point.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Confirmation Dialog (Inline) ────────────────────────────────────────────────

function ConfirmationSection({
  type,
  courseTitle,
  isProcessing,
  onConfirm,
}: {
  type: "archive" | "delete";
  courseTitle: string;
  isProcessing: boolean;
  onConfirm: () => void;
}) {
  const [inputValue, setInputValue] = useState("");
  const isMatch = inputValue === courseTitle;

  const isArchive = type === "archive";

  return (
    <div
      className={`border-2 rounded-xl p-6 space-y-4 ${
        isArchive
          ? "border-amber-500/30 bg-amber-500/5"
          : "border-red-500/30 bg-red-500/5"
      }`}
    >
      <div className="flex items-center gap-3">
        {isArchive ? (
          <Archive className="w-5 h-5 text-amber-500" />
        ) : (
          <Trash2 className="w-5 h-5 text-red-500" />
        )}
        <h3
          className={`text-lg font-bold ${
            isArchive
              ? "text-amber-600 dark:text-amber-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {isArchive ? "Archive Course" : "Permanently Delete Course"}
        </h3>
      </div>

      <p className="text-sm text-secondary-text">
        {isArchive
          ? "The course will be hidden from all listings but all data (students, progress, reviews, certificates) will be preserved. The course can be restored later by changing its status."
          : "This will permanently destroy the course and ALL related data including student purchases, progress, certificates, reviews, quiz attempts, and assignments. This action is IRREVERSIBLE."}
      </p>

      <div className="space-y-2">
        <label className="text-sm font-medium text-primary-text">
          Type{" "}
          <span
            className={`font-mono px-1.5 py-0.5 rounded text-sm ${
              isArchive
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
            }`}
          >
            {courseTitle}
          </span>{" "}
          to confirm
        </label>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter the exact course title..."
          className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand/50"
        />
      </div>

      <button
        onClick={onConfirm}
        disabled={!isMatch || isProcessing}
        className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
          isArchive
            ? "bg-amber-500 hover:bg-amber-600 disabled:hover:bg-amber-500"
            : "bg-red-600 hover:bg-red-700 disabled:hover:bg-red-600"
        }`}
      >
        {isProcessing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isArchive ? (
          <>
            <Archive className="w-5 h-5" />
            Archive Course
          </>
        ) : (
          <>
            <Trash2 className="w-5 h-5" />
            Permanently Delete Course
          </>
        )}
      </button>
    </div>
  );
}

// ─── Detail Stat Row

function DetailStat({
  icon: Icon,
  label,
  value,
  subvalue,
  iconColor = "text-secondary-text",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subvalue?: string;
  iconColor?: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div className="w-8 h-8 rounded-lg bg-surface-muted flex items-center justify-center shrink-0">
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-secondary-text">{label}</p>
        <p className="text-base font-semibold text-primary-text">{value}</p>
      </div>
      {subvalue && (
        <span className="text-xs text-secondary-text px-2 py-1 bg-surface-muted rounded-full whitespace-nowrap">
          {subvalue}
        </span>
      )}
    </div>
  );
}

// ─── Main Component

export default function CourseDeleteReview({
  data,
}: {
  data: CourseDeleteReviewData;
}) {
  const router = useRouter();
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeAction, setActiveAction] = useState<"archive" | "delete" | null>(
    null,
  );

  const { request, course, tutor, analytics } = data;

  const handleArchive = async () => {
    setIsArchiving(true);
    try {
      const result = await archiveCourse(request.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          "Course archived successfully. All data has been preserved.",
        );
        router.push("/org/requests");
        router.refresh();
      }
    } catch {
      toast.error("An error occurred while archiving the course.");
    } finally {
      setIsArchiving(false);
    }
  };

  const handlePermanentDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await permanentlyDeleteCourse(request.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Course permanently deleted.");
        router.push("/org/requests");
        router.refresh();
      }
    } catch {
      toast.error("An error occurred while deleting the course.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* ── Back Navigation  */}
      <button
        onClick={() => router.push("/org/requests")}
        className="flex items-center gap-2 text-sm text-secondary-text hover:text-primary-text transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Requests
      </button>

      {/* ── Course Header  */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="flex flex-col md:flex-row gap-6 p-6">
          {/* Course Image */}
          <div className="w-full md:w-48 h-32 md:h-32 rounded-lg overflow-hidden shrink-0 bg-surface-muted relative">
            {course.imageUrl ? (
              <Image
                src={course.imageUrl}
                alt={course.title}
                width={192}
                height={128}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement
                    ?.querySelector("[data-fallback]")
                    ?.removeAttribute("hidden");
                }}
              />
            ) : null}
            <div
              data-fallback
              {...(course.imageUrl ? { hidden: true } : {})}
              className="absolute inset-0 flex items-center justify-center bg-surface-muted"
            >
              <BookOpen className="w-10 h-10 text-secondary-text" />
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-500">
                Delete Request
              </span>
              <span
                className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
                  course.status === "PUBLISHED"
                    ? "border-green-500/20 text-green-500"
                    : course.status === "DRAFT"
                      ? "border-amber-500/20 text-amber-500"
                      : "border-secondary-text/20 text-secondary-text"
                }`}
              >
                {course.status}
              </span>
              <span className="text-xs text-secondary-text">
                Created {format(new Date(course.createdAt), "MMM d, yyyy")}
              </span>
              {course.price !== null && course.price > 0 && (
                <span className="text-xs font-semibold text-brand">
                  {formatPrice(course.price)}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-primary-text">
              {course.title}
            </h1>

            {course.description && (
              <p className="text-sm text-secondary-text line-clamp-2">
                {course.description}
              </p>
            )}

            {/* Tutor Info */}
            {tutor && (
              <div className="flex items-center gap-2">
                {tutor.imageUrl ? (
                  <Image
                    src={tutor.imageUrl}
                    alt="Tutor"
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center">
                    <UserIcon className="w-3.5 h-3.5 text-brand" />
                  </div>
                )}
                <span className="text-sm font-medium text-primary-text">
                  {tutor.firstName} {tutor.lastName}
                </span>
                <span className="text-xs text-secondary-text">
                  {tutor.email}
                </span>
              </div>
            )}

            {/* Tags */}
            {course.tags && course.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {course.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-xs bg-surface-muted text-secondary-text rounded-full border border-border"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tutor's Reason */}
        <div className="border-t border-border px-6 py-4 bg-red-50/50 dark:bg-red-900/5">
          <h4 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">
            Tutor&apos;s Reason for Deletion
          </h4>
          <p className="text-sm text-primary-text whitespace-pre-wrap leading-relaxed">
            {request.reason}
          </p>
          <p className="text-xs text-secondary-text mt-2">
            Submitted{" "}
            {format(new Date(request.createdAt), "MMM d, yyyy 'at' h:mm a")}
          </p>
        </div>
      </div>

      {/* ── KPI Cards  */}
      <div>
        <h2 className="text-lg font-bold text-primary-text mb-4">
          Course Analytics Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard
            label="Total Revenue"
            value={formatPrice(analytics.totalRevenue)}
            subtitle="lifetime"
            icon={DollarSign}
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            iconColor="text-blue-600 dark:text-blue-400"
          />
          <KpiCard
            label="Total Students"
            value={analytics.totalStudents.toLocaleString()}
            subtitle="enrolled"
            icon={Users}
            iconBg="bg-cyan-100 dark:bg-cyan-900/30"
            iconColor="text-cyan-600 dark:text-cyan-400"
          />
          <KpiCard
            label="Completion Rate"
            value={`${analytics.completionRate}%`}
            subtitle={`${analytics.completedStudents} completed`}
            icon={CheckCircle}
            iconBg="bg-green-100 dark:bg-green-900/30"
            iconColor="text-green-600 dark:text-green-400"
          />
          <KpiCard
            label="Avg Rating"
            value={
              analytics.averageRating !== null
                ? `${analytics.averageRating}★`
                : "–"
            }
            subtitle={`${analytics.totalReviews} reviews`}
            icon={Star}
            iconBg="bg-amber-100 dark:bg-amber-900/30"
            iconColor="text-amber-600 dark:text-amber-400"
          />
          <KpiCard
            label="Total Likes"
            value={analytics.totalLikes.toLocaleString()}
            subtitle="likes"
            icon={Heart}
            iconBg="bg-pink-100 dark:bg-pink-900/30"
            iconColor="text-pink-600 dark:text-pink-400"
          />
          <KpiCard
            label="Course Ranking"
            value={`#${analytics.courseRanking.rank}`}
            subtitle={`of ${analytics.courseRanking.totalCourses} courses`}
            icon={Trophy}
            iconBg="bg-yellow-100 dark:bg-yellow-900/30"
            iconColor="text-yellow-600 dark:text-yellow-400"
          />
        </div>
      </div>

      {/* ── Detailed Metrics  */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student & Completion Details */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-base font-semibold text-primary-text mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-secondary-text" />
            Student & Completion Details
          </h3>
          <div>
            <DetailStat
              icon={Users}
              label="Active Enrollments"
              value={analytics.activeEnrollments}
              subvalue="still in progress"
              iconColor="text-cyan-500"
            />
            <DetailStat
              icon={CheckCircle}
              label="Completed Students"
              value={analytics.completedStudents}
              subvalue={`${analytics.completionRate}% completion rate`}
              iconColor="text-green-500"
            />
            <DetailStat
              icon={Award}
              label="Certificates Issued"
              value={analytics.certificatesIssued}
              iconColor="text-purple-500"
            />
            <DetailStat
              icon={Heart}
              label="Total Likes"
              value={analytics.totalLikes}
              iconColor="text-pink-500"
            />
            <DetailStat
              icon={Star}
              label="Reviews"
              value={analytics.totalReviews}
              subvalue={
                analytics.averageRating !== null
                  ? `${analytics.averageRating}★ avg`
                  : "no ratings"
              }
              iconColor="text-amber-500"
            />
          </div>
        </div>

        {/* Quiz & Assignment Details */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-base font-semibold text-primary-text mb-4 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-secondary-text" />
            Quiz & Assignment Performance
          </h3>
          <div>
            <DetailStat
              icon={BrainCircuit}
              label="Average Quiz Score"
              value={
                analytics.avgQuizScore !== null
                  ? `${analytics.avgQuizScore}%`
                  : "–"
              }
              subvalue={
                analytics.avgQuizScore !== null
                  ? "across all quizzes"
                  : "no quizzes"
              }
              iconColor="text-purple-500"
            />
            <DetailStat
              icon={BarChart3}
              label="Quiz Pass Rate"
              value={
                analytics.quizPassRate !== null
                  ? `${analytics.quizPassRate}%`
                  : "–"
              }
              subvalue={`${analytics.totalQuizAttempts} total attempts`}
              iconColor="text-indigo-500"
            />
            <DetailStat
              icon={FileCheck}
              label="Total Assignment Submissions"
              value={analytics.assignmentSubmissions.total}
              iconColor="text-teal-500"
            />
            <DetailStat
              icon={Clock}
              label="Pending Submissions"
              value={analytics.assignmentSubmissions.pending}
              subvalue="awaiting grading"
              iconColor="text-amber-500"
            />
            <DetailStat
              icon={CheckCircle}
              label="Graded Submissions"
              value={analytics.assignmentSubmissions.graded}
              iconColor="text-green-500"
            />
            <DetailStat
              icon={XCircle}
              label="Rejected Submissions"
              value={analytics.assignmentSubmissions.rejected}
              iconColor="text-red-500"
            />
          </div>
        </div>
      </div>

      {/* ── Trend Charts  */}
      <div>
        <h2 className="text-lg font-bold text-primary-text mb-4">
          Revenue & Enrollment Trends
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-surface border border-border rounded-xl p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-secondary-text" />
              <h3 className="text-base font-semibold text-primary-text">
                Revenue Trend
              </h3>
            </div>
            <p className="text-sm text-secondary-text mb-4">
              Monthly revenue over the last 6 months
            </p>
            <div className="h-64 flex-1">
              <RevenueChart data={analytics.revenueByMonth} />
            </div>
          </div>

          {/* Enrollment Bar Chart */}
          <SimpleBarChart
            data={analytics.enrollmentsByMonth}
            title="New Enrollments"
            subtitle="Monthly student enrollments over 6 months"
            icon={UserPlus}
            barColor="bg-cyan-500 dark:bg-cyan-400"
            formatValue={(val) => val.toLocaleString()}
          />
        </div>
      </div>

      {/* ── Impact Warning  */}
      <div className="bg-red-50 dark:bg-red-900/10 border-2 border-red-500/20 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400">
              Deletion Impact Summary
            </h3>
            <p className="text-sm text-primary-text leading-relaxed">
              This course has{" "}
              <span className="font-bold">
                {analytics.totalStudents} enrolled student
                {analytics.totalStudents !== 1 ? "s" : ""}
              </span>
              ,{" "}
              <span className="font-bold">
                {analytics.certificatesIssued} certificate
                {analytics.certificatesIssued !== 1 ? "s" : ""} issued
              </span>
              , and has generated{" "}
              <span className="font-bold">
                {formatPrice(analytics.totalRevenue)}
              </span>{" "}
              in total revenue.
              {analytics.activeEnrollments > 0 && (
                <>
                  {" "}
                  <span className="font-bold text-red-600 dark:text-red-400">
                    {analytics.activeEnrollments} student
                    {analytics.activeEnrollments !== 1 ? "s are" : " is"}{" "}
                    currently in progress.
                  </span>
                </>
              )}
              {analytics.assignmentSubmissions.pending > 0 && (
                <>
                  {" "}
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {analytics.assignmentSubmissions.pending} assignment
                    {analytics.assignmentSubmissions.pending !== 1
                      ? "s are"
                      : " is"}{" "}
                    awaiting grading.
                  </span>
                </>
              )}
            </p>
            <p className="text-xs text-secondary-text">
              Permanent deletion will cascade to all related data. Archiving
              will preserve everything while hiding the course from listings.
            </p>
          </div>
        </div>
      </div>

      {/* ── Action Section  */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-primary-text">
          Choose an Action
        </h2>

        {/* Action Toggle Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() =>
              setActiveAction(activeAction === "archive" ? null : "archive")
            }
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              activeAction === "archive"
                ? "border-amber-500 bg-amber-500/5"
                : "border-border hover:border-amber-500/50 bg-surface"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Archive
                className={`w-5 h-5 ${
                  activeAction === "archive"
                    ? "text-amber-500"
                    : "text-secondary-text"
                }`}
              />
              <span className="font-semibold text-primary-text">
                Archive Course
              </span>
            </div>
            <p className="text-sm text-secondary-text">
              Hide from listings. All data preserved. Reversible.
            </p>
          </button>

          <button
            onClick={() =>
              setActiveAction(activeAction === "delete" ? null : "delete")
            }
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              activeAction === "delete"
                ? "border-red-500 bg-red-500/5"
                : "border-border hover:border-red-500/50 bg-surface"
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <Trash2
                className={`w-5 h-5 ${
                  activeAction === "delete"
                    ? "text-red-500"
                    : "text-secondary-text"
                }`}
              />
              <span className="font-semibold text-primary-text">
                Permanently Delete
              </span>
            </div>
            <p className="text-sm text-secondary-text">
              Destroy course and ALL related data. Irreversible.
            </p>
          </button>
        </div>

        {/* Confirmation Section */}
        {activeAction === "archive" && (
          <ConfirmationSection
            type="archive"
            courseTitle={course.title}
            isProcessing={isArchiving}
            onConfirm={handleArchive}
          />
        )}

        {activeAction === "delete" && (
          <ConfirmationSection
            type="delete"
            courseTitle={course.title}
            isProcessing={isDeleting}
            onConfirm={handlePermanentDelete}
          />
        )}
      </div>

      {/* ── Reject Request (Send Back)  */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-primary-text">
              Not ready to decide?
            </h3>
            <p className="text-sm text-secondary-text">
              You can reject this request and send it back to the tutor.
            </p>
          </div>
          <button
            onClick={() => router.push("/org/requests")}
            className="px-4 py-2 text-sm font-medium text-secondary-text hover:text-primary-text border border-border rounded-lg hover:bg-surface-muted transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
