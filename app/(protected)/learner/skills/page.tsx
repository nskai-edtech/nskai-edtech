import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserSkillProfile, getSkillGaps } from "@/actions/skills/queries";
import { SkillProfile } from "@/components/skills/skill-mastery";
import { SkillGapCourses } from "@/components/skills/skill-gap-courses";
import Link from "next/link";
import { Target, ArrowRight } from "lucide-react";

export default async function SkillsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const [profileResult, gapsResult] = await Promise.all([
    getUserSkillProfile(),
    getSkillGaps(),
  ]);

  const profile =
    "error" in profileResult ? [] : profileResult.skills;
  const gaps = "error" in gapsResult ? [] : gapsResult.gaps;

  const hasSkills = profile.length > 0;

  return (
    <div className="space-y-8 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary-text">
            Skills & Assessment
          </h1>
          <p className="text-secondary-text mt-1">
            Track your skill mastery and find courses to fill knowledge gaps
          </p>
        </div>
        <Link
          href="/learner/skills/assess"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-lg font-medium hover:bg-brand/90 transition-colors shadow-lg shadow-brand/20"
        >
          <Target className="w-4 h-4" />
          {hasSkills ? "Retake Assessment" : "Take Assessment"}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {hasSkills ? (
        <>
          {/* Skill Profile */}
          <SkillProfile skills={profile} />

          {/* Skill Gap Recommendations */}
          {gaps.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-primary-text mb-4">
                Recommended for You
              </h2>
              <SkillGapCourses gaps={gaps} />
            </div>
          )}
        </>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-brand/10 flex items-center justify-center mb-6">
            <Target className="w-10 h-10 text-brand" />
          </div>
          <h2 className="text-2xl font-bold text-primary-text mb-3">
            No Skills Assessed Yet
          </h2>
          <p className="text-secondary-text max-w-md mb-8">
            Take a quick diagnostic assessment to discover your strengths,
            identify knowledge gaps, and get personalized course recommendations.
          </p>
          <Link
            href="/learner/skills/assess"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-lg font-medium hover:bg-brand/90 transition-colors shadow-lg shadow-brand/20"
          >
            <Target className="w-5 h-5" />
            Start Assessment
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      )}
    </div>
  );
}
