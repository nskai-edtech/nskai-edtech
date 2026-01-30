import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { userProgress, users } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = await auth();
    const { isCompleted, lessonId } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get internal user ID
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId)
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if progress exists
    const existingProgress = await db.query.userProgress.findFirst({
      where: and(
        eq(userProgress.userId, user.id),
        eq(userProgress.lessonId, lessonId)
      ),
    });

    if (existingProgress) {
      await db
        .update(userProgress)
        .set({
          isCompleted,
          lastAccessedAt: new Date(),
        })
        .where(eq(userProgress.id, existingProgress.id));
    } else {
      await db.insert(userProgress).values({
        userId: user.id,
        lessonId,
        isCompleted,
        lastAccessedAt: new Date(),
      });
    }

    return NextResponse.json({ message: "Progress updated" });

  } catch (error) {
    console.error("[PROGRESS_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = await auth();
    const { courseId } = await params;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId)
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // specific course progress?? 
    // Usually we want all progress for the course to show checkmarks.
    // The previous implementation plan said: "Get User Progress"

    // Let's fetch all progress records for this user where lesson -> chapter -> courseId matches?
    // OR just return all progress for the user and let frontend filter?
    // Better: Fetch progress for lessons belonging to this course.

    // JOIN is harder in Drizzle query builder without relations setup fully for deep filtering.
    // But we have relations!

    /*
    const progress = await db.query.userProgress.findMany({
        where: eq(userProgress.userId, user.id),
        with: {
            lesson: {
                with: {
                    chapter: {
                        where: eq(chapters.courseId, courseId) 
                    }
                }
            }
        }
    })
    */
    // Filtering nested relations in Drizzle query builder isn't always essentially "filtering the parent".
    // It filters the included relation.

    // Simplest acceptable approach for MVP: Return ALL progress for the user. Frontend maps it.
    // Or simpler: published courses are few.

    const progress = await db.query.userProgress.findMany({
      where: eq(userProgress.userId, user.id),
      columns: {
        lessonId: true,
        isCompleted: true,
      }
    });

    return NextResponse.json(progress);

  } catch (error) {
    console.error("[PROGRESS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

