import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { lessons, purchases, muxData, chapters, courses, users } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: Request,
  {
    params,
  }: { params: { courseId: string; chapterId: string; lessonId: string } }
) {
  try {
    const { userId } = await auth();
    const { courseId, chapterId, lessonId } = await params;

    // 1. Fetch Lesson Data (Video, Description, etc.)
    const lesson = await db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId),
      with: {
        muxData: true,
      },
    });

    if (!lesson) {
      return new NextResponse("Lesson not found", { status: 404 });
    }

    // 2. Access Control Logic
    const isFree = lesson.isFreePreview;

    // If it's free, return it
    if (isFree) {
      return NextResponse.json(lesson);
    }

    // If not free, user must be logged in
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user bought the course
    const purchase = await db.query.purchases.findFirst({
      where: and(
        eq(purchases.userId, userId), // Can't easily use internal ID without mapping, but let's assume Clerk ID sync or we need to map first.
        // WAIT: purchases table uses UUID for userId. 
        // We MUST fetch internal user ID from Clerk ID first.
        eq(purchases.courseId, courseId)
      ),
    });

    // We need to fix the User ID check. `purchases.userId` is a UUID from our `users` table. `userId` from auth() is Clerk ID.
    // So we must fetch the internal user.

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId)
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const validPurchase = await db.query.purchases.findFirst({
      where: and(
        eq(purchases.userId, user.id),
        eq(purchases.courseId, courseId)
      )
    });

    if (!validPurchase) {
      return new NextResponse("Forbidden: Course not purchased", { status: 403 });
    }

    return NextResponse.json(lesson);

  } catch (error) {
    console.error("[LESSON_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
