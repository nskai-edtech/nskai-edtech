import { CourseReviews } from "@/components/courses/course-reviews";
import { getCourseRatingStats } from "@/actions/reviews";
import { checkEnrollment } from "@/actions/courses";

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
