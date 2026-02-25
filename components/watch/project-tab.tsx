"use client";

import { useState } from "react";
import { Loader2, FileText, CheckCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { submitAssignment } from "@/actions/assessments/actions";
import { UploadDropzone } from "@/lib/uploadthing";
import { AssignmentWithSubmissions } from "@/types";

interface ProjectTabProps {
  assignment: AssignmentWithSubmissions;
}

export const ProjectTab = ({ assignment }: ProjectTabProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const submission = assignment.submissions?.[0];

  const onSubmit = async (fileUrl: string) => {
    setIsSubmitting(true);
    try {
      const res = await submitAssignment(assignment.id, fileUrl);
      if (res.error) toast.error(res.error);
      else toast.success("Project submitted successfully!");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!assignment) return null;

  const status = submission?.status;
  const isPassing =
    status === "GRADED" &&
    (submission?.score ?? 0) >= assignment.maxScore * 0.7;
  const isRejected = status === "REJECTED";
  const isFailed = status === "GRADED" && !isPassing;
  const canSubmit = !submission || isRejected || isFailed;

  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-xl p-6 border border-border mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-primary-text">
            {assignment.title}
          </h3>
          <span className="bg-brand/10 text-brand px-3 py-1 rounded-full text-sm font-bold">
            Max Score: {assignment.maxScore}
          </span>
        </div>

        {assignment.description && (
          <div
            className="prose dark:prose-invert max-w-none text-secondary-text mb-6"
            dangerouslySetInnerHTML={{ __html: assignment.description }}
          />
        )}

        <div className="border-t border-border pt-6 mt-6">
          <h4 className="text-lg font-bold text-primary-text mb-4">
            Your Submission
          </h4>

          {canSubmit ? (
            <div className="space-y-4">
              {isRejected && (
                <div className="p-4 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 text-sm">
                  <strong>Rejected:</strong> Your submission was rejected and
                  not graded. Kindly read the tutor&apos;s review below and
                  submit a new file.
                  {submission?.feedback && (
                    <div className="mt-3 p-3 bg-red-500/10 rounded-md border border-red-500/20 text-red-600 whitespace-pre-wrap font-medium">
                      {submission.feedback}
                    </div>
                  )}
                </div>
              )}
              {isFailed && (
                <div className="p-4 bg-amber-500/10 text-amber-600 rounded-lg border border-amber-500/20 text-sm">
                  <strong>Assessment Graded:</strong> You scored{" "}
                  {submission?.score} / {assignment.maxScore}, but the pass mark
                  is {Math.ceil(assignment.maxScore * 0.7)}. Read the
                  tutor&apos;s review to help improve your grade.
                  {submission?.feedback && (
                    <div className="mt-3 p-3 bg-amber-500/10 rounded-md border border-amber-500/20 text-amber-700 whitespace-pre-wrap font-medium">
                      {submission.feedback}
                    </div>
                  )}
                </div>
              )}
              {(isUploading || isSubmitting) && (
                <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-in fade-in duration-300">
                  <div className="w-full max-w-md bg-surface-muted rounded-full h-4 overflow-hidden border border-border">
                    <div
                      className="bg-brand h-full rounded-full transition-all duration-300 ease-out"
                      style={{
                        width: `${isSubmitting ? 100 : uploadProgress}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-3 text-primary-text font-bold text-lg">
                    <Loader2 className="w-6 h-6 animate-spin text-brand" />
                    {isSubmitting
                      ? "Saving Submission..."
                      : `Uploading... ${uploadProgress}%`}
                  </div>
                </div>
              )}
              <div className={isUploading || isSubmitting ? "hidden" : "block"}>
                <UploadDropzone
                  endpoint="courseAttachment"
                  onUploadBegin={() => {
                    setIsUploading(true);
                    setUploadProgress(0);
                  }}
                  onUploadProgress={(p) => setUploadProgress(p)}
                  onClientUploadComplete={(res) => {
                    setIsUploading(false);
                    if (res?.[0]) {
                      onSubmit(res[0].url);
                    }
                  }}
                  onUploadError={(error: Error) => {
                    setIsUploading(false);
                    toast.error(`ERROR! ${error.message}`);
                  }}
                />
              </div>
            </div>
          ) : status === "PENDING" ? (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 text-center">
              <Clock className="w-8 h-8 text-amber-500 mx-auto mb-3" />
              <h5 className="font-bold text-amber-500 mb-1">Pending Review</h5>
              <p className="text-sm text-secondary-text mb-3">
                Your project has been submitted and is awaiting grading.
              </p>
              <a
                href={submission.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-brand hover:underline font-medium"
              >
                <FileText className="w-4 h-4" /> View Submitted File
              </a>
            </div>
          ) : status === "GRADED" ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <h5 className="font-bold text-green-500">
                    Assessment passed: You reached the cut-off mark for passing.
                    Congratulations
                  </h5>
                  <p className="text-sm font-medium text-primary-text mt-1">
                    Score: {submission.score} / {assignment.maxScore}
                  </p>
                </div>
              </div>
              {submission.feedback && (
                <div className="bg-surface p-4 rounded-lg mt-4 shadow-inner">
                  <p className="text-sm font-bold text-primary-text mb-1">
                    Tutor Feedback:
                  </p>
                  <p className="text-sm text-secondary-text whitespace-pre-wrap">
                    {submission.feedback}
                  </p>
                </div>
              )}
              <a
                href={submission.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-brand hover:underline font-medium mt-4 border-t border-border pt-4 w-full"
              >
                <FileText className="w-4 h-4" /> View Submitted File
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
