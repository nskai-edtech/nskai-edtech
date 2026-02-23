import { CourseReviews } from "@/components/courses/course-reviews";
import { checkEnrollment } from "@/actions/courses/student";
import { getCourseRatingStats } from "@/actions/reviews/queries";

export async function CourseReviewsWrapper({ courseId }: { courseId: string }) {
  const courseRatingStats = await getCourseRatingStats(courseId);
  const isEnrolled = await checkEnrollment(courseId);

  return (
    <CourseReviews
      courseId={courseId}
      isEnrolled={isEnrolled}
      initialStats={courseRatingStats}
    />
  );
}
