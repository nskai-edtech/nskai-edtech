import {
  type RecentEnrollment,
  type QuizPerformance,
} from "@/actions/analytics";
import { formatPrice } from "@/lib/format";
import { Clock, BrainCircuit, CheckCircle2, XCircle } from "lucide-react";

export function RecentEnrollmentsFeed({
  enrollments,
}: {
  enrollments: RecentEnrollment[];
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <Clock className="w-4 h-4 text-secondary-text" />
        <h3 className="font-semibold text-primary-text">Recent Enrollments</h3>
      </div>

      {enrollments.length === 0 ? (
        <div className="py-8 text-center text-secondary-text text-sm">
          No enrollments yet.
        </div>
      ) : (
        <div className="space-y-1">
          {enrollments.map((enrollment, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-muted/50 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-brand">
                  {enrollment.studentName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary-text truncate">
                  {enrollment.studentName}
                </p>
                <p className="text-xs text-secondary-text truncate">
                  {enrollment.courseTitle}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-medium text-primary-text">
                  {formatPrice(enrollment.amount)}
                </p>
                <p className="text-[10px] text-secondary-text">
                  {new Date(enrollment.enrolledAt).toLocaleDateString("en-NG", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function QuizPerformancePanel({
  quizzes,
}: {
  quizzes: QuizPerformance[];
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <BrainCircuit className="w-4 h-4 text-secondary-text" />
        <h3 className="font-semibold text-primary-text">Quiz Performance</h3>
      </div>

      {quizzes.length === 0 ? (
        <div className="py-8 text-center text-secondary-text text-sm">
          No quiz data yet. Create quiz lessons to see performance.
        </div>
      ) : (
        <div className="space-y-1">
          {quizzes.map((quiz) => (
            <div
              key={quiz.lessonId}
              className="p-3 rounded-lg hover:bg-surface-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-primary-text truncate">
                    {quiz.lessonTitle}
                  </p>
                  <p className="text-xs text-secondary-text truncate">
                    {quiz.courseTitle}
                  </p>
                </div>
                <span className="text-xs text-secondary-text shrink-0 ml-2">
                  {quiz.totalAttempts} attempts
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-20 h-1.5 bg-surface-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        quiz.avgScore >= 70 ? "bg-green-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${quiz.avgScore}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-secondary-text tabular-nums">
                    {quiz.avgScore}% avg
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {quiz.passRate >= 70 ? (
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                  ) : (
                    <XCircle className="w-3 h-3 text-amber-500" />
                  )}
                  <span className="text-xs font-medium text-secondary-text tabular-nums">
                    {quiz.passRate}% pass
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
