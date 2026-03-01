import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createRateLimiter } from "@/lib/rate-limit";

// 20 messages per 60-second window per user
const rateLimiter = createRateLimiter({ maxRequests: 20, windowMs: 60_000 });

export async function POST(req: Request) {
  try {
    // ── Auth ──
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // ── Rate limit ──
    const { allowed, remaining, resetInMs } = rateLimiter(userId);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait before sending another message." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(resetInMs / 1000)),
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }

    const { lessonId, message } = await req.json();

    if (!lessonId || !message) {
      return new NextResponse("Missing lessonId or message", { status: 400 });
    }

    // 1. Get the Python server URL from your environment variables
    // (We use a fallback just in case it's not set in your .env yet)
    const pythonAiUrl =
      process.env.PYTHON_AI_CHAT_URL || "http://localhost:8000/api/chat";

    // 2. Forward the request to the Python team's engine
    const pythonResponse = await fetch(pythonAiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-ai-secret": process.env.AI_WEBHOOK_SECRET || "",
      },
      body: JSON.stringify({ lessonId, message }),
    });

    if (!pythonResponse.ok) {
      console.error("Python Server Error:", pythonResponse.statusText);
      return new NextResponse("AI Engine Error", { status: 502 });
    }

    return new Response(pythonResponse.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-RateLimit-Remaining": String(remaining),
      },
    });
  } catch (error) {
    console.error("[AI_CHAT_PROXY_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
