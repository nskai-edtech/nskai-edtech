"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Loader2 } from "lucide-react";
import { createLearningPath } from "@/actions/learning-paths";

export function CreatePathModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await createLearningPath(title, description);

      if (res.success && res.path) {
        setIsOpen(false);
        // Navigate straight to the path builder
        router.push(`/org/paths/${res.path.id}`);
      } else {
        alert(res.error || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 bg-brand text-white px-5 py-2.5 rounded-xl font-bold hover:bg-brand/90 transition-colors shadow-sm shrink-0 whitespace-nowrap w-full md:w-auto"
      >
        <PlusCircle className="w-5 h-5" />
        New Path
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="bg-surface border border-border rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-black text-primary-text mb-2">
              Name your Learning Path
            </h2>
            <p className="text-sm text-secondary-text mb-6">
              You can adjust this later and attach specific courses.
            </p>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-primary-text">
                  Path Title
                </label>
                <input
                  disabled={isLoading}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Complete Full-Stack Track"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand font-medium text-primary-text placeholder:text-secondary-text/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-primary-text">
                  Short Description
                </label>
                <textarea
                  disabled={isLoading}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What will learners achieve?"
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand font-medium text-primary-text placeholder:text-secondary-text/50 min-h-[100px] resize-none"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-3 px-4 bg-surface hover:bg-surface-muted text-primary-text font-bold rounded-xl transition-colors border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !title}
                  className="flex-1 py-3 px-4 bg-brand text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Continue"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
