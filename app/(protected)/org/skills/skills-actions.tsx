"use client";

import { useState } from "react";
import { Plus, Loader2, X } from "lucide-react";
import { createSkill } from "@/actions/skills/admin";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export function SkillsActions() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();

  const handleCreate = async () => {
    if (!title.trim() || !category.trim()) return;
    setIsSubmitting(true);
    const result = await createSkill({
      title: title.trim(),
      category: category.trim(),
      description: description.trim() || undefined,
    });
    setIsSubmitting(false);

    if ("error" in result && result.error) {
      toast.error(result.error as string);
      return;
    }

    toast.success("Skill created!");
    setTitle("");
    setCategory("");
    setDescription("");
    setIsOpen(false);
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-lg font-medium hover:bg-brand/90 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Create Skill
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative bg-surface border border-border rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary-text">
                Create Skill
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md hover:bg-surface-muted transition-colors"
              >
                <X className="w-5 h-5 text-secondary-text" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-primary-text mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. JavaScript Fundamentals"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-text mb-1">
                  Category *
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Web Development"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-text mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand/50 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-secondary-text hover:text-primary-text transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={!title.trim() || !category.trim() || isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg font-medium hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
