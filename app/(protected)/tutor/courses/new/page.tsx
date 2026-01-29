"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCourse } from "@/actions/courses";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function NewCoursePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    imageUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Course title is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createCourse({
        title: formData.title,
        description: formData.description || undefined,
        price: formData.price ? parseInt(formData.price) * 100 : undefined, // Convert to Kobo
        imageUrl: formData.imageUrl || undefined,
      });

      if (result.error) {
        toast.error(result.error);
      } else if (result.course) {
        toast.success("Course created successfully!");
        router.push(`/tutor/courses/${result.course.id}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create course");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/tutor/courses"
          className="inline-flex items-center gap-2 text-secondary-text hover:text-primary-text mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses
        </Link>
        <h1 className="text-3xl font-bold text-primary-text">
          Create New Course
        </h1>
        <p className="text-secondary-text mt-2">
          Fill in the basic details for your course. You can add chapters and
          lessons after creation.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-primary-text mb-2"
          >
            Course Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="e.g., Advanced Prompt Engineering"
            className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand/50"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-primary-text mb-2"
          >
            Course Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Describe what students will learn..."
            rows={4}
            className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand/50 resize-none"
          />
        </div>

        {/* Price */}
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-primary-text mb-2"
          >
            Price (₦)
          </label>
          <input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            placeholder="0 for free course"
            min="0"
            className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand/50"
          />
          <p className="text-xs text-secondary-text mt-1">
            Leave blank or enter 0 for a free course
          </p>
        </div>

        {/* Image URL */}
        <div>
          <label
            htmlFor="imageUrl"
            className="block text-sm font-medium text-primary-text mb-2"
          >
            Course Image URL
          </label>
          <input
            id="imageUrl"
            type="url"
            value={formData.imageUrl}
            onChange={(e) =>
              setFormData({ ...formData, imageUrl: e.target.value })
            }
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand/50"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand/90 disabled:bg-brand/50 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Create Course
              </>
            )}
          </button>
          <Link
            href="/tutor/courses"
            className="px-6 py-3 border border-border hover:bg-surface-muted rounded-lg font-medium text-primary-text transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
