import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getGroq } from "@/lib/groq";
import { createRateLimiter } from "@/lib/rate-limit";

// 10 enhance requests per 60-second window per user
const rateLimiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 });

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { allowed, remaining, resetInMs } = rateLimiter(userId);
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

    const { description } = await req.json();

    if (
      !description ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return NextResponse.json(
        { error: "A description is required to enhance." },
        { status: 400 },
      );
    }

    const completion = await getGroq().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: `You are an expert course copywriter for a professional online education platform. Your job is to take a rough course description written by a tutor and rewrite it to be professional, engaging, and conversion-optimized.

Rules:
- Keep the same core meaning, intent, and subject matter as the original.
- Make it sound polished, clear, and appealing to prospective students.
- Highlight learning outcomes and value where appropriate.
- Aim for 150-300 words.
- Use a warm but professional tone.
- Do NOT add markdown formatting, bullet points, or headers — return plain flowing text only.
- Do NOT add any commentary, preamble, or explanation — return ONLY the enhanced description text.`,
        },
        {
          role: "user",
          content: `Enhance this course description:\n\n"${description.trim()}"`,
        },
      ],
    });

    const enhanced =
      completion.choices[0]?.message?.content?.trim() ?? description;

    return NextResponse.json(
      { enhanced },
      {
        headers: {
          "X-RateLimit-Remaining": String(remaining),
        },
      },
    );
  } catch (error) {
    console.error("[ENHANCE_DESCRIPTION]", error);
    return NextResponse.json(
      { error: "Failed to enhance description. Please try again." },
      { status: 500 },
    );
  }
}
