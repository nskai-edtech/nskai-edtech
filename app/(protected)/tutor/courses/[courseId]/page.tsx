import { getCourseById } from "@/actions/courses";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import CourseEditor from "@/components/dashboard/course-editor";

interface CoursePageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseId } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get current user
  const currentUser = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!currentUser || currentUser.role !== "TUTOR") {
    redirect("/");
  }

  // Get course with all chapters and lessons
  const course = await getCourseById(courseId);

  if (!course) {
    notFound();
  }

  // Verify ownership
  if (course.tutorId !== currentUser.id) {
    redirect("/tutor/courses");
  }

  return <CourseEditor course={course} />;
}
