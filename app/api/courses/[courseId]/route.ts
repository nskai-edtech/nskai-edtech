import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { courses } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = await params;

    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      with: {
        chapters: {
          orderBy: (chapters, { asc }) => [asc(chapters.position)],
          with: {
            lessons: {
              orderBy: (lessons, { asc }) => [asc(lessons.position)],
              columns: {
                id: true,
                title: true,
                position: true,
                isFreePreview: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("[COURSE_ID_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
