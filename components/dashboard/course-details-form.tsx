"use client";

import { useState, useEffect } from "react";
import { updateCourse } from "@/actions/courses";
import {
  Save,
  Loader2,
  Image as ImageIcon,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

type Course = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  imageUrl: string | null;
  isPublished: boolean | null;
  status: "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED";
};

interface CourseDetailsFormProps {
  course: Course;
  onUpdate: (updatedCourse: Course) => void;
}

export default function CourseDetailsForm({
  course,
  onUpdate,
}: CourseDetailsFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: course.title,
    description: course.description || "",
    price: course.price ? (course.price / 100).toString() : "",
    imageUrl: course.imageUrl || "",
  });

  // Update form data when course prop changes
  useEffect(() => {
    setFormData({
      title: course.title,
      description: course.description || "",
      price: course.price ? (course.price / 100).toString() : "",
      imageUrl: course.imageUrl || "",
    });
  }, [course]);

  const handleSave = async () => {
    if (!formData.title) {
      toast.error("Course title is required");
      return;
    }

    if (!formData.imageUrl) {
      toast.error("Course image is important and not optional");
      return;
    }

    setIsSaving(true);

    try {
      const priceValue = formData.price
        ? Math.floor(parseFloat(formData.price) * 100)
        : 0;

      const result = await updateCourse(course.id, {
        title: formData.title,
        description: formData.description || undefined,
        price: priceValue,
        imageUrl: formData.imageUrl || undefined,
      });

      if (result.error) {
        toast.error(result.error);
      } else if (result.course) {
        toast.success("Course updated!");
        onUpdate(result.course as Course);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save course details");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary-text">
            Course Settings
          </h2>
          <p className="text-secondary-text text-sm mt-1">
            Manage your course identity, details and pricing.
          </p>
          <div className="flex items-center gap-2 mt-3">
            {course.status === "PUBLISHED" ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                Published
              </span>
            ) : course.status === "PENDING" ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800 animate-pulse">
                Pending Approval
              </span>
            ) : course.status === "REJECTED" ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
                Rejected
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-muted text-secondary-text border border-border">
                Draft
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand hover:bg-brand/90 disabled:bg-brand/50 text-white rounded-xl font-semibold transition-all shadow-lg shadow-brand/20 disabled:cursor-not-allowed active:scale-95"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Course Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-primary-text mb-2"
            >
              Course Title <span className="text-brand">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., Advanced AI Engineering"
              className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all font-medium"
            />
          </div>

          {/* Course Price */}
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-semibold text-primary-text mb-2"
            >
              Course Price (₦)
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text font-bold group-focus-within:text-brand transition-colors">
                ₦
              </span>
              <input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all font-mono font-bold"
              />
            </div>
            <p className="text-[10px] text-secondary-text mt-2 uppercase tracking-tight">
              Set a price for your course. Leave as 0 for a free course.
            </p>
          </div>

          {/* Image URL */}
          <div>
            <label
              htmlFor="imageUrl"
              className="block text-sm font-semibold text-primary-text mb-2"
            >
              Course Thumbnail URL <span className="text-brand">*</span>
            </label>
            <div className="relative group">
              <input
                id="imageUrl"
                type="text"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all text-sm"
              />
              {formData.imageUrl && (
                <a
                  href={formData.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-secondary-text hover:text-brand hover:bg-brand/10 rounded-lg transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            {!formData.imageUrl && (
              <div className="flex items-center gap-2 mt-2 text-amber-500">
                <AlertCircle className="w-3 h-3" />
                <span className="text-[10px] font-medium uppercase tracking-tight">
                  Image preview is important and not optional
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail Preview Card */}
        <div>
          <label className="block text-sm font-semibold text-primary-text mb-2">
            Card Preview
          </label>
          <div className="aspect-video relative rounded-2xl overflow-hidden border-2 border-dashed border-border flex flex-col items-center justify-center bg-surface-muted/30 group">
            {formData.imageUrl ? (
              <Image
                src={formData.imageUrl}
                alt="Course preview"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                onLoadingComplete={(img) => {
                  if (img.naturalWidth === 0) {
                    // Fallback or error handled by Next.js or UI
                  }
                }}
              />
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mb-3">
                  <ImageIcon className="w-8 h-8 text-secondary-text" />
                </div>
                <p className="text-xs text-secondary-text font-medium text-center px-4">
                  Enter a valid image URL to see the preview here
                </p>
              </>
            )}

            {/* Overlay Badge */}
            <div className="absolute top-4 right-4 px-3 py-1 bg-brand/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-lg">
              Preview
            </div>
          </div>

          <div className="mt-4 p-4 bg-brand/5 rounded-2xl border border-brand/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-primary-text truncate max-w-[200px]">
                  {formData.title || "Course Title"}
                </h4>
                <p className="text-xs text-brand font-bold">
                  ₦
                  {formData.price
                    ? parseFloat(formData.price).toLocaleString()
                    : "0"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-semibold text-primary-text mb-2"
        >
          Detailed Description
        </label>
        <div className="border border-border rounded-2xl overflow-hidden bg-surface shadow-sm focus-within:ring-2 focus-within:ring-brand/50 transition-all">
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Introduce your course, what students will learn, and professional outcomes..."
            rows={10}
            className="w-full px-6 py-4 bg-transparent text-primary-text placeholder:text-secondary-text focus:outline-none resize-none leading-relaxed"
          />
        </div>
        <p className="text-[10px] text-secondary-text mt-3 text-right font-medium uppercase tracking-tight">
          Recommended length: 200-500 words for better conversion.
        </p>
      </div>
    </div>
  );
}
