import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
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
      },
    });
  } catch (error) {
    console.error("[AI_CHAT_PROXY_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
