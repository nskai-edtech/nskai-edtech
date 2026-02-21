import { getAdminLearningPaths } from "@/actions/learning-paths";
import { Layers, Calendar } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { CreatePathModal } from "./_components/create-path-modal";

export default async function OrgPathsPage() {
  const paths = await getAdminLearningPaths();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-primary-text mb-2">
            Curriculum Paths
          </h1>
          <p className="text-secondary-text">
            Bundle existing courses together into sequential learning tracks.
          </p>
        </div>

        {/* We will build this client modal next */}
        <CreatePathModal />
      </div>

      {paths.length === 0 ? (
        <div className="bg-surface border border-border rounded-3xl p-12 text-center shadow-sm">
          <Layers className="w-12 h-12 mx-auto text-brand/30 mb-4" />
          <h3 className="text-xl font-bold text-primary-text mb-2">
            No Learning Paths Yet
          </h3>
          <p className="text-secondary-text max-w-md mx-auto">
            Group related courses together to guide your learners through a
            comprehensive curriculum.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paths.map((path) => (
            <Link
              key={path.id}
              href={`/org/paths/${path.id}`}
              className="bg-surface border border-border rounded-3xl p-6 hover:shadow-md hover:-translate-y-1 transition-all group block"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-brand">
                  <Layers className="w-6 h-6" />
                </div>
                {!path.isPublished && (
                  <span className="px-3 py-1 bg-secondary-bg text-secondary-text text-[10px] font-bold uppercase tracking-wider rounded-lg">
                    Draft
                  </span>
                )}
              </div>
              <h3 className="font-bold text-lg text-primary-text mb-2 group-hover:text-brand transition-colors line-clamp-1">
                {path.title}
              </h3>
              <p className="text-sm text-secondary-text line-clamp-2 mb-4 h-10">
                {path.description || "No description provided."}
              </p>

              <div className="flex items-center gap-2 text-xs text-secondary-text font-medium border-t border-border pt-4">
                <Calendar className="w-4 h-4" />
                Added {format(new Date(path.createdAt), "MMM d, yyyy")}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
