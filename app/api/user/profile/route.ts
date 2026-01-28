import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const profile = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!profile) {
      return new NextResponse("Profile not found. Webhook sync might be pending.", { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("[PROFILE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const values = await req.json();
    const { bio, expertise, firstName, lastName } = values;

    const updatedProfile = await db
      .update(users)
      .set({
        bio,
        expertise,
        firstName,
        lastName,
      })
      .where(eq(users.clerkId, userId))
      .returning();

    return NextResponse.json(updatedProfile[0]);
  } catch (error) {
    console.error("[PROFILE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
