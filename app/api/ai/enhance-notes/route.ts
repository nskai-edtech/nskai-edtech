import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getGroq } from "@/lib/groq";
import { createRateLimiter, createIpRateLimiter } from "@/lib/rate-limit";

// ── Initializations ──
// 15 user requests per 60-second window
const userRateLimiter = createRateLimiter({ maxRequests: 15, windowMs: 60_000 });
// 20 IP requests per 10-second window (matches previous Upstash config)
const ipRateLimiter = createIpRateLimiter({ maxRequests: 20, windowMs: 10_000 });

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    const { allowed: ipAllowed, remaining: ipRemaining, resetInMs: ipResetInMs } = ipRateLimiter(ip);
    if (!ipAllowed) {
      return NextResponse.json(
        { error: "Too many requests from your IP. Please wait a moment." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(ipResetInMs / 1000)),
            "X-RateLimit-Remaining": String(ipRemaining),
          },
        },
      );
    }

    // Authentication
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // User Rate Limiting
    const { allowed, remaining, resetInMs } = userRateLimiter(userId);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait before trying again." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(resetInMs / 1000)),
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }

    // Parse Request
    const body = await req.json();
    const { notes } = body;

    if (!notes || typeof notes !== "string" || notes.trim() === "") {
      return NextResponse.json(
        { error: "Notes content is required." },
        { status: 400 },
      );
    }

    //  AI Prompt
    const prompt = `You are an expert educational copyeditor. Enhance the following lesson notes to make them clearer, highly professional, and more engaging for students. 
    
    CRITICAL INSTRUCTIONS:
    - Fix any typos or grammatical errors.
    - If the input contains HTML tags (like <p>, <ul>, <strong>), you MUST preserve the HTML structure in your output.
    - Do not add unnecessary fluff; keep it educational and concise.
    - You MUST return a JSON object with a single key "enhanced" containing the improved notes as a string.

    Input Notes:
    ${notes}`;

    const completion = await getGroq().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI educational editor. Always output in JSON format.",
        },
        { role: "user", content: prompt },
      ],
    });

    // 7. Parse and Return
    const parsedData = JSON.parse(
      completion.choices[0]?.message?.content || "{}",
    );
    const enhancedNotes = parsedData.enhanced;

    if (!enhancedNotes) {
      return NextResponse.json(
        { error: "AI failed to generate enhanced notes." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { enhanced: enhancedNotes },
      { headers: { "X-RateLimit-Remaining": String(remaining) } },
    );
  } catch (error) {
    console.error("[ENHANCE_NOTES]", error);
    return NextResponse.json(
      { error: "Failed to process request. Please try again." },
      { status: 500 },
    );
  }
}
