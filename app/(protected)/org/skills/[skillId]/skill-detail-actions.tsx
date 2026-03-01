"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Loader2, X } from "lucide-react";
import { updateSkill, deleteSkill } from "@/actions/skills/admin";
import toast from "react-hot-toast";
import type { SkillDetail } from "@/actions/skills/types";

export function SkillDetailActions({ skill }: { skill: SkillDetail }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState(skill.title);
  const [category, setCategory] = useState(skill.category);
  const [description, setDescription] = useState(skill.description || "");

  const handleUpdate = async () => {
    if (!title.trim() || !category.trim()) return;
    setIsSubmitting(true);
    const res = await updateSkill(skill.id, {
      title: title.trim(),
      category: category.trim(),
      description: description.trim() || undefined,
    });
    setIsSubmitting(false);
    if ("error" in res && res.error) {
      toast.error(res.error as string);
      return;
    }
    toast.success("Skill updated!");
    setEditing(false);
    router.refresh();
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    const res = await deleteSkill(skill.id);
    setIsSubmitting(false);
    if ("error" in res && res.error) {
      toast.error(res.error as string);
      return;
    }
    toast.success("Skill deleted");
    router.push("/org/skills");
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-secondary-text hover:text-primary-text border border-border rounded-lg hover:bg-surface-muted transition-colors"
        >
          <Pencil className="w-4 h-4" /> Edit
        </button>
        <button
          type="button"
          onClick={() => setDeleting(true)}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-500 hover:text-red-600 border border-border rounded-lg hover:bg-red-500/5 transition-colors"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setEditing(false)}
          />
          <div className="relative bg-surface border border-border rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary-text">
                Edit Skill
              </h2>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="p-1 rounded-md hover:bg-surface-muted"
              >
                <X className="w-5 h-5 text-secondary-text" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-primary-text mb-1">
                  Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-primary-text focus:outline-none focus:ring-2 focus:ring-brand/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-1">
                  Category
                </label>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-primary-text focus:outline-none focus:ring-2 focus:ring-brand/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-text mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-primary-text focus:outline-none focus:ring-2 focus:ring-brand/50 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 text-sm text-secondary-text hover:text-primary-text"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                disabled={!title.trim() || !category.trim() || isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg font-medium hover:bg-brand/90 disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDeleting(false)}
          />
          <div className="relative bg-surface border border-border rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4 text-center">
            <Trash2 className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-lg font-semibold text-primary-text">
              Delete &quot;{skill.title}&quot;?
            </h2>
            <p className="text-sm text-secondary-text">
              This will also remove all assessment questions and user scores for
              this skill. This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleting(false)}
                className="px-4 py-2 text-sm text-secondary-text hover:text-primary-text"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete Skill
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
