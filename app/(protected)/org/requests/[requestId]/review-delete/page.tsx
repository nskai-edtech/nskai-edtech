import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getCourseDeleteReview } from "@/actions/admin/course-delete-review";
import CourseDeleteReview from "@/components/dashboard/course-delete-review";

export default async function ReviewDeletePage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  const { sessionClaims, userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (sessionClaims?.metadata?.role !== "ORG_ADMIN") {
    redirect("/");
  }

  const result = await getCourseDeleteReview(requestId);

  if (result.error || !result.data) {
    redirect("/org/requests");
  }

  return (
    <div className="p-6 space-y-6">
      <CourseDeleteReview data={result.data} />
    </div>
  );
}
