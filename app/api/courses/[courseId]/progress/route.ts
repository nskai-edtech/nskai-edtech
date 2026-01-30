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
