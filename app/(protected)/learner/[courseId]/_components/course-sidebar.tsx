import { Video, Download, Globe, Star } from "lucide-react";
import { CourseEnrollButton } from "@/components/courses/course-enroll-button";
import { checkEnrollment } from "@/actions/courses";

interface CourseSidebarProps {
  courseId: string;
  price: number | null;
  totalLessons: number;
}

export async function CourseSidebar({
  courseId,
  price,
  totalLessons,
}: CourseSidebarProps) {
  const isEnrolled = await checkEnrollment(courseId);

  return (
    <div className="bg-surface border border-border rounded-3xl p-6 shadow-xl shadow-brand/5 ring-1 ring-border">
      <div className="space-y-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-primary-text">
            {price ? `₦${(price / 100).toLocaleString()}` : "Free"}
          </span>
          {price && (
            <span className="text-lg text-secondary-text line-through font-medium opacity-50">
              ₦{(price / 80).toLocaleString()}
            </span>
          )}
        </div>

        <CourseEnrollButton
          courseId={courseId}
          isEnrolled={isEnrolled}
          price={price}
        />

        <p className="text-[10px] text-center text-secondary-text font-semibold uppercase tracking-wider">
          30-day money-back guarantee
        </p>

        <div className="space-y-4 pt-6 border-t border-border">
          <h4 className="font-bold text-primary-text text-sm">
            This course includes:
          </h4>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-sm text-secondary-text">
              <Video className="w-4 h-4 text-brand" />
              <span className="font-medium text-primary-text/80">
                {totalLessons} on-demand video lessons
              </span>
            </li>
            <li className="flex items-center gap-3 text-sm text-secondary-text">
              <Download className="w-4 h-4 text-brand" />
              <span className="font-medium text-primary-text/80">
                12 downloadable resources
              </span>
            </li>
            <li className="flex items-center gap-3 text-sm text-secondary-text">
              <Globe className="w-4 h-4 text-brand" />
              <span className="font-medium text-primary-text/80">
                Full lifetime access
              </span>
            </li>
            <li className="flex items-center gap-3 text-sm text-secondary-text">
              <Star className="w-4 h-4 text-brand" />
              <span className="font-medium text-primary-text/80">
                Certificate of completion
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
