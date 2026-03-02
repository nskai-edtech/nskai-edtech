import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { submitFeedback } from "@/lib/ai-service";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const result = await submitFeedback({
      userId: clerkId,
      prompt: body.prompt,
      response: body.response,
      rating: body.rating,
      feedbackText: body.feedbackText ?? null,
      category: body.category ?? null,
      conversationTrace: body.conversationTrace ?? [],
      sessionId: body.sessionId ?? null,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[AI_FEEDBACK_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
