import { db } from "@/lib/db";
import { courses } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { CourseResponse } from "@/types/api";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const publishedCourses = await db.query.courses.findMany({
      where: eq(courses.isPublished, true),
      with: {
        tutor: {
          columns: {
            firstName: true,
            lastName: true,
          }
        }
      },
      orderBy: (courses, { desc }) => [desc(courses.createdAt)],
    });

    return successResponse<CourseResponse[]>(publishedCourses as CourseResponse[]);
  } catch (error) {
    console.error("[COURSES_GET]", error);
    return errorResponse("Internal Error", 500);
  }
}
