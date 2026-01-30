import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { courses } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

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

    return NextResponse.json(publishedCourses);
  } catch (error) {
    console.error("[COURSES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
