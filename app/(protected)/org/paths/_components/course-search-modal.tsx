"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Loader2, Search, BookOpen } from "lucide-react";
import {
  searchCoursesForPath,
  addCourseToPath,
} from "@/actions/learning-paths";
import Image from "next/image";

interface CourseResult {
  id: string;
  title: string;
  imageUrl: string | null;
  isPublished: boolean | null;
  tutor: { firstName: string | null; lastName: string | null } | null;
}

export function CourseSearchModal({ pathId }: { pathId: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<CourseResult[]>([]);
  const [addingCourseId, setAddingCourseId] = useState<string | null>(null);

  // Simple initial fetch of top available courses
  useEffect(() => {
    if (isOpen) {
      loadCourses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      const data = await searchCoursesForPath(searchQuery);
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (courseId: string) => {
    try {
      setAddingCourseId(courseId);
      const res = await addCourseToPath(pathId, courseId);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Failed to attach course.");
      }
    } catch (error) {
      console.error("Error attaching courses", error);
      alert("Something went wrong");
    } finally {
      setAddingCourseId(null);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 bg-brand text-white px-5 py-2.5 rounded-xl font-bold hover:bg-brand/90 transition-colors shadow-sm shrink-0 whitespace-nowrap w-full md:w-auto"
      >
        <Search className="w-5 h-5" />
        Add Course
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="bg-surface border border-border rounded-[32px] p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-black text-primary-text mb-1">
                  Attach Courses
                </h2>
                <p className="text-sm text-secondary-text">
                  Search the marketplace to build your curriculum sequence.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 bg-surface-muted hover:bg-surface-muted/80 rounded-full transition-colors text-primary-text"
              >
                Done
              </button>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-text border-r border-border pr-2 block" />
              <input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  // In a real app we would strictly debounce this
                  setIsLoading(true);
                  searchCoursesForPath(e.target.value).then((res) => {
                    setResults(res);
                    setIsLoading(false);
                  });
                }}
                placeholder="Search published courses..."
                className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand font-medium text-primary-text placeholder:text-secondary-text/50"
              />
            </div>

            <div className="flex-1 overflow-y-auto min-h-[300px] border border-border rounded-2xl p-2 bg-surface-muted/30">
              {isLoading ? (
                <div className="flex justify-center items-center h-full text-secondary-text">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : results.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-secondary-text p-6 text-center">
                  <BookOpen className="w-12 h-12 text-border mb-4" />
                  <p className="font-bold text-primary-text">
                    No courses found
                  </p>
                  <p className="text-sm">Try adjusting your search terms.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {results.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center gap-4 bg-surface p-3 rounded-xl border border-border/50 hover:border-brand/30 transition-colors"
                    >
                      <div className="relative w-16 aspect-square bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        {course.imageUrl ? (
                          <Image
                            src={course.imageUrl}
                            alt={course.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-gray-300" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-primary-text truncate">
                          {course.title}
                        </h4>
                        <p className="text-[10px] text-secondary-text font-medium uppercase tracking-wider">
                          {course.tutor?.firstName || "Unknown"}
                        </p>
                      </div>

                      <button
                        onClick={() => handleAdd(course.id)}
                        disabled={addingCourseId === course.id}
                        className="p-2 bg-brand/10 hover:bg-brand/20 text-brand rounded-lg font-bold transition-colors disabled:opacity-50"
                        title="Add to Bundle"
                      >
                        {addingCourseId === course.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <PlusCircle className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
