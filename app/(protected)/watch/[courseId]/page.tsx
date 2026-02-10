import { getCourseOutline } from "@/actions/lesson-viewer";
import { redirect } from "next/navigation";

export default async function WatchCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await getCourseOutline(courseId);

  if (!course) {
    return redirect("/learner/enrolled");
  }

  // Find the first lesson
  const firstLesson = course.chapters[0]?.lessons[0];

  if (!firstLesson) {
    // If no lessons, just stay here or show empty state (but redirecting back is safer)
    return redirect("/learner/enrolled");
  }

  return redirect(`/watch/${courseId}/${firstLesson.id}`);
}
