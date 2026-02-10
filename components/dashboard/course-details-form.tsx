import { useState, useEffect } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { updateCourse } from "@/actions/courses";
import { Course } from "@/types";
import { Loader2, Image as ImageIcon, Cloud, X } from "lucide-react";
import { FileUpload } from "@/components/file-upload";

interface CourseDetailsFormProps {
  course: Course;
  onUpdate: (course: Course) => void;
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

  // Debounce the form data
  const debouncedData = useDebounce(formData, 1000);
  const [isMounted, setIsMounted] = useState(false);

  // Update form data when course prop changes
  useEffect(() => {
    setFormData({
      title: course.title,
      description: course.description || "",
      price: course.price ? (course.price / 100).toString() : "",
      imageUrl: course.imageUrl || "",
    });
  }, [course]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const save = async () => {
      // Deep comparison to prevent auto-save if nothing changed
      const currentPrice = course.price ? (course.price / 100).toString() : "";
      const isTitleSame = debouncedData.title === course.title;
      const isDescriptionSame =
        (debouncedData.description || "") === (course.description || "");
      const isPriceSame = (debouncedData.price || "") === (currentPrice || "");
      const isImageSame =
        (debouncedData.imageUrl || "") === (course.imageUrl || "");

      if (isTitleSame && isDescriptionSame && isPriceSame && isImageSame) {
        return;
      }

      // Validation checks
      if (!debouncedData.title) return;

      setIsSaving(true);
      try {
        const priceValue = debouncedData.price
          ? Math.floor(parseFloat(debouncedData.price) * 100)
          : 0;

        const result = await updateCourse(course.id, {
          title: debouncedData.title,
          description: debouncedData.description || undefined,
          price: priceValue,
          imageUrl: debouncedData.imageUrl || undefined,
        });

        if (result.error) {
          toast.error(result.error);
        } else if (result.course) {
          onUpdate(result.course as Course);
        }
      } catch (error) {
        console.error("Auto-save failed:", error);
        toast.error("Auto-save failed");
      } finally {
        setIsSaving(false);
      }
    };

    save();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedData]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary-text">
            Course Settings
          </h2>
          <p className="text-secondary-text text-sm mt-1">
            Manage your course identity, details, and pricing.
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

        <div className="flex items-center gap-2">
          {isSaving ? (
            <div className="flex items-center gap-2 text-primary-text bg-surface border border-border px-3 py-1.5 rounded-full text-xs font-medium animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              Auto saving...
            </div>
          ) : (
            <div className="flex items-center gap-2 text-secondary-text bg-surface-muted border border-border px-3 py-1.5 rounded-full text-xs font-medium">
              <Cloud className="w-3 h-3" />
              Saved
            </div>
          )}
        </div>
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

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-primary-text mb-2">
              Course Thumbnail <span className="text-brand">*</span>
            </label>
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              {formData.imageUrl ? (
                <div className="relative aspect-video">
                  <Image
                    src={formData.imageUrl}
                    alt="Upload"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => setFormData({ ...formData, imageUrl: "" })}
                      className="p-2 bg-white rounded-full hover:bg-white/90 transition-colors"
                      title="Remove image"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                    {/* Change image logic would require unsetting and showing uploader again, effectively same as remove */}
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <FileUpload
                    endpoint="courseImage"
                    onChange={(url) => {
                      if (url) {
                        setFormData({ ...formData, imageUrl: url });
                      }
                    }}
                  />
                  <div className="text-center mt-2">
                    <p className="text-[10px] text-secondary-text uppercase tracking-tight">
                      16:9 aspect ratio recommended
                    </p>
                  </div>
                </div>
              )}
            </div>
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
              />
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center mb-3">
                  <ImageIcon className="w-8 h-8 text-secondary-text" />
                </div>
                <p className="text-xs text-secondary-text font-medium text-center px-4">
                  Upload an image to see the preview here
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
