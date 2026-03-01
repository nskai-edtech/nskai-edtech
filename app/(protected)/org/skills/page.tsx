import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getAllSkills } from "@/actions/skills/admin";
import Link from "next/link";
import { DebouncedSearch } from "@/components/debounced-search";
import { Pencil, Users, HelpCircle } from "lucide-react";
import { SkillsActions } from "./skills-actions";

export default async function AdminSkillsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { sessionClaims } = await auth();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") redirect("/");

  const params = await searchParams;
  const search = params.search || "";

  const result = await getAllSkills();
  if ("error" in result) redirect("/org");

  // Client-side filter by search query
  const filtered = search
    ? result.skills.filter(
        (s) =>
          s.title.toLowerCase().includes(search.toLowerCase()) ||
          s.category.toLowerCase().includes(search.toLowerCase()),
      )
    : result.skills;

  // Group by category
  const grouped = filtered.reduce<Record<string, typeof result.skills>>(
    (acc, skill) => {
      const cat = skill.category || "Uncategorized";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    },
    {},
  );

  const categoryNames = Object.keys(grouped).sort();

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-text">
            Skills Management
          </h1>
          <p className="text-secondary-text mt-1">
            Create and manage skills, dependencies, and assessment questions
          </p>
        </div>
        <SkillsActions />
      </div>

      {/* Search */}
      <DebouncedSearch basePath="/org/skills" placeholder="Search skills..." />

      {/* Stats Bar */}
      <div className="flex flex-wrap gap-4 text-sm text-secondary-text">
        <span>
          <strong className="text-primary-text">{result.skills.length}</strong>{" "}
          skills
        </span>
        <span>
          <strong className="text-primary-text">{categoryNames.length}</strong>{" "}
          categories
        </span>
        <span>
          <strong className="text-primary-text">
            {result.skills.reduce((sum, s) => sum + s.questionCount, 0)}
          </strong>{" "}
          questions
        </span>
      </div>

      {/* Skills by Category */}
      {categoryNames.length === 0 ? (
        <div className="text-center py-16 text-secondary-text">
          {search
            ? `No skills matching "${search}"`
            : 'No skills created yet. Click "Create Skill" to get started.'}
        </div>
      ) : (
        <div className="space-y-6">
          {categoryNames.map((category) => (
            <div key={category}>
              <h2 className="text-lg font-semibold text-primary-text mb-3">
                {category}
              </h2>
              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-muted text-secondary-text">
                      <th className="text-left px-4 py-3 font-medium">Skill</th>
                      <th className="text-center px-4 py-3 font-medium w-28">
                        <div className="flex items-center justify-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5" />
                          Questions
                        </div>
                      </th>
                      <th className="text-center px-4 py-3 font-medium w-28">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          Learners
                        </div>
                      </th>
                      <th className="text-right px-4 py-3 font-medium w-32">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {grouped[category].map((skill) => (
                      <tr
                        key={skill.id}
                        className="hover:bg-surface-muted/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/org/skills/${skill.id}`}
                            className="font-medium text-primary-text hover:text-brand transition-colors"
                          >
                            {skill.title}
                          </Link>
                          {skill.description && (
                            <p className="text-xs text-secondary-text mt-0.5 line-clamp-1">
                              {skill.description}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={
                              skill.questionCount === 0
                                ? "text-red-500"
                                : "text-primary-text"
                            }
                          >
                            {skill.questionCount}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-primary-text">
                          {skill.userCount}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/org/skills/${skill.id}`}
                              className="p-1.5 rounded-md hover:bg-surface-muted transition-colors text-secondary-text hover:text-primary-text"
                              title="Edit & manage questions"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
