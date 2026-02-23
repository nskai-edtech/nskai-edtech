import { getLearningPathDetails } from "@/actions/learning-paths/actions";
import { BookOpen, Layers, ShieldCheck, Trophy } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CourseSearchModal } from "../_components/course-search-modal";
import { RemoveCourseButton } from "../_components/remove-course-button";
import { PathActions } from "../_components/path-actions";

interface PageProps {
  params: Promise<{ pathId: string }>;
}

export default async function LearningPathPage({ params }: PageProps) {
  const { pathId } = await params;
  const path = await getLearningPathDetails(pathId);

  if (!path) {
    return notFound();
  }

  const formatPrice = (priceInKobo: number | null) => {
    if (!priceInKobo) return "Free";
    return `₦${(priceInKobo / 100).toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <div className="bg-surface border-b border-border py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-bold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              Professional Track
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-primary-text leading-tight">
              {path.title}
            </h1>

            <p className="text-lg text-secondary-text leading-relaxed max-w-xl">
              {path.description ||
                "Master these skills through our curated sequence of professional courses."}
            </p>

            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-secondary-text" />
                <span className="font-bold text-primary-text">
                  {path.attachedCourses.length} Courses
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-secondary-text" />
                <span className="font-bold text-primary-text">
                  Official Certification
                </span>
              </div>
            </div>
          </div>

          <div className="relative aspect-video rounded-[32px] overflow-hidden border-8 border-surface-muted shadow-2xl">
            {path.imageUrl ? (
              <Image
                src={path.imageUrl}
                alt={path.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-brand/5 flex items-center justify-center">
                <Layers className="w-20 h-20 text-brand/20" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Curriculum Grid */}
      <main className="max-w-7xl mx-auto px-6 mt-16">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-primary-text flex items-center gap-3">
                Track Curriculum
                <span className="text-sm font-bold text-secondary-text bg-surface-muted px-3 py-1 rounded-full">
                  Step-by-Step
                </span>
              </h2>
              <CourseSearchModal pathId={path.id} />
            </div>

            <div className="space-y-4">
              {path.attachedCourses.map((item, index) => (
                <div
                  key={item.courseId}
                  className="group flex gap-6 p-6 bg-surface border border-border rounded-3xl hover:border-brand/50 transition-all relative"
                >
                  <div className="shrink-0 w-12 h-12 rounded-2xl bg-primary-text text-white flex items-center justify-center font-black text-xl">
                    {index + 1}
                  </div>

                  <div className="flex-1 space-y-1 pr-12 md:pr-24">
                    <h3 className="text-xl font-bold text-primary-text group-hover:text-brand transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-secondary-text font-medium">
                      Instructed by {item.tutorFirstName} {item.tutorLastName}
                    </p>
                    <div className="flex items-center gap-4 pt-2">
                      <span className="text-xs font-bold text-brand bg-brand/10 px-2 py-1 rounded">
                        {formatPrice(item.price)}
                      </span>
                      {item.status !== "PUBLISHED" && (
                        <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-1 rounded">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
                    <RemoveCourseButton mappingId={item.mappingId} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing/Action Sidebar */}
          <div className="space-y-6">
            <div className="bg-surface border border-border p-8 rounded-[40px] shadow-xl sticky top-32">
              <Trophy className="w-12 h-12 text-brand mb-6" />
              <h3 className="text-2xl font-black text-primary-text mb-2">
                Manage Bundle
              </h3>
              <p className="text-secondary-text text-sm font-medium mb-8">
                {path.isPublished
                  ? "This learning path is currently visible to learners."
                  : "Draft mode. Add courses and publish when ready."}
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-secondary-text">
                    Total Value
                  </span>
                  <span className="text-lg font-bold line-through text-secondary-text/50">
                    {formatPrice(path.totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-primary-text">
                    Bundle Price
                  </span>
                  <span className="text-3xl font-black text-brand">
                    {formatPrice(path.price || path.totalPrice)}
                  </span>
                </div>
              </div>

              <PathActions
                pathId={path.id}
                isPublished={path.isPublished ?? false}
                hasCourses={path.attachedCourses.length > 0}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
