import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { reviewCode, type CodeReviewRequest } from "@/lib/ai-service";
import { reviewCodeLocal, isLowQualityFallback } from "@/lib/code-review-local";
import { createRateLimiter } from "@/lib/rate-limit";

// 10 review requests per 60-second window per user
const rateLimiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 });

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { allowed, remaining, resetInMs } = rateLimiter(clerkId);
    if (!allowed) {
      return NextResponse.json(
        {
          error:
            "Too many requests. Please wait before submitting another review.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(resetInMs / 1000)),
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }

    const body = await req.json();

    if (!body.code) {
      return NextResponse.json(
        { error: "Missing code to review" },
        { status: 400 },
      );
    }

    const reviewRequest: CodeReviewRequest = {
      code: body.code,
      language: body.language ?? "python",
      studentLevel: body.studentLevel ?? "intermediate",
      exerciseId: body.exerciseId ?? null,
      conversationId: body.conversationId ?? null,
      userFollowup: body.userFollowup ?? null,
    };

    // Try the Python AI backend first, fall back to local OpenAI
    let result;
    try {
      result = await reviewCode(reviewRequest);

      // If the backend returned a low-quality fallback, retry with local OpenAI
      if (isLowQualityFallback(result)) {
        console.warn(
          "[CODE_REVIEW] Python backend returned low-quality fallback, using local OpenAI",
        );
        result = await reviewCodeLocal(reviewRequest);
      }
    } catch (backendError) {
      console.warn(
        "[CODE_REVIEW] Python backend unavailable, using local OpenAI:",
        backendError,
      );
      result = await reviewCodeLocal(reviewRequest);
    }

    return NextResponse.json(result, {
      headers: { "X-RateLimit-Remaining": String(remaining) },
    });
  } catch (error) {
    console.error("[CODE_REVIEW_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
