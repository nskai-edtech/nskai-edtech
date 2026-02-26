import Link from "next/link";
import { FileText, User, Clock, AlertCircle } from "lucide-react";

interface RecentSubmissionsProps {
  submissions: Array<{
    id: string;
    status: string;
    score: number | null;
    submittedAt: Date;
    assignment: {
      id: string;
      title: string;
    };
    course: {
      id: string;
      title: string;
    };
    user: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      imageUrl: string | null;
    };
  }>;
}

export function RecentSubmissions({ submissions }: RecentSubmissionsProps) {
  if (submissions.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-primary-text mb-4">
          Recent Submissions
        </h3>
        <div className="py-12 text-center">
          <FileText className="w-12 h-12 text-secondary-text/40 mx-auto mb-4" />
          <p className="text-secondary-text font-medium">
            No pending submissions
          </p>
          <p className="text-sm text-secondary-text mt-1">
            All assignments have been reviewed
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-primary-text">
          Recent Submissions
        </h3>
        <Link
          href="/tutor/submissions"
          className="text-sm text-brand hover:underline font-medium"
        >
          View All
        </Link>
      </div>

      <div className="space-y-3">
        {submissions.slice(0, 5).map((submission) => (
          <Link
            key={submission.id}
            href={`/tutor/submissions/${submission.id}`}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-muted/50 transition-colors group"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100/50 dark:bg-blue-900/20 shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-medium text-primary-text text-sm truncate group-hover:text-brand">
                  {submission.assignment.title}
                </h4>
                {submission.status === "PENDING" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium shrink-0">
                    <AlertCircle className="w-3 h-3" />
                    Pending
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-secondary-text">
                <User className="w-3 h-3" />
                <span className="truncate">
                  {submission.user.firstName} {submission.user.lastName}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 mt-2">
                <span className="text-xs text-secondary-text">
                  {submission.course.title}
                </span>
                <div className="flex items-center gap-1 text-xs text-secondary-text">
                  <Clock className="w-3 h-3" />
                  {new Date(submission.submittedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
