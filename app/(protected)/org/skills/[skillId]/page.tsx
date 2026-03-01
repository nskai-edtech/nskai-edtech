import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSkillDetails } from "@/actions/skills/admin";
import { getAssessmentQuestionsAdmin } from "@/actions/skills/assessments-admin";
import Link from "next/link";
import { ArrowLeft, BookOpen, GitBranch } from "lucide-react";
import { SkillDetailActions } from "./skill-detail-actions";
import { QuestionManager } from "./question-manager";

export default async function AdminSkillDetailPage({
  params,
}: {
  params: Promise<{ skillId: string }>;
}) {
  const { sessionClaims } = await auth();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") redirect("/");

  const { skillId } = await params;

  const [detailResult, questionsResult] = await Promise.all([
    getSkillDetails(skillId),
    getAssessmentQuestionsAdmin(skillId),
  ]);

  if ("error" in detailResult) redirect("/org/skills");

  const skill = detailResult.skill;
  const questions = "error" in questionsResult ? [] : questionsResult.questions;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Back Link */}
      <Link
        href="/org/skills"
        className="inline-flex items-center gap-1 text-sm text-secondary-text hover:text-primary-text transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Skills Management
      </Link>

      {/* Skill Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-text">
            {skill.title}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 rounded-full bg-brand/10 text-brand text-xs font-medium">
              {skill.category}
            </span>
            <span className="text-sm text-secondary-text">
              {skill.questionCount} question
              {skill.questionCount !== 1 ? "s" : ""}
            </span>
          </div>
          {skill.description && (
            <p className="text-secondary-text mt-2 text-sm max-w-xl">
              {skill.description}
            </p>
          )}
        </div>
        <SkillDetailActions skill={skill} />
      </div>

      {/* Dependencies Section */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Prerequisites */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-primary-text mb-3 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-secondary-text" />
            Prerequisites
          </h2>
          {skill.prerequisites.length > 0 ? (
            <div className="space-y-2">
              {skill.prerequisites.map((p) => (
                <Link
                  key={p.id}
                  href={`/org/skills/${p.prerequisiteSkillId}`}
                  className="flex items-center justify-between p-2 bg-surface-muted rounded-lg hover:bg-brand/5 transition-colors"
                >
                  <span className="text-sm text-primary-text font-medium">
                    {p.title}
                  </span>
                  <span className="text-xs text-secondary-text">
                    {p.category}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-secondary-text">No prerequisites set.</p>
          )}
        </div>

        {/* Dependents */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-primary-text mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-secondary-text" />
            Unlocks
          </h2>
          {skill.dependents.length > 0 ? (
            <div className="space-y-2">
              {skill.dependents.map((d) => (
                <Link
                  key={d.id}
                  href={`/org/skills/${d.skillId}`}
                  className="flex items-center justify-between p-2 bg-surface-muted rounded-lg hover:bg-brand/5 transition-colors"
                >
                  <span className="text-sm text-primary-text font-medium">
                    {d.title}
                  </span>
                  <span className="text-xs text-secondary-text">
                    {d.category}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-secondary-text">
              No skills depend on this one.
            </p>
          )}
        </div>
      </div>

      {/* Questions Section */}
      <div>
        <h2 className="text-lg font-semibold text-primary-text mb-4">
          Assessment Questions
        </h2>
        <QuestionManager skillId={skillId} initialQuestions={questions} />
      </div>
    </div>
  );
}
