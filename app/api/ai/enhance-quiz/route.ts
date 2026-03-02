import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Groq from "groq-sdk";
import { createRateLimiter } from "@/lib/rate-limit";

function extractJSON(text: string): string {
  // Strip markdown code fences if present
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  return text.trim();
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
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
    const body = await req.json();
    if (body.action === "enhance") {
      const { questionText, options, correctOption } = body;
      if (
        !questionText ||
        !Array.isArray(options) ||
        typeof correctOption !== "number"
      ) {
        return NextResponse.json(
          { error: "Invalid question data." },
          { status: 400 },
        );
      }
      const prompt = `You are an expert quiz editor for an online learning platform. Given a multiple-choice question and its options, rewrite the question and options to be clearer, more professional, and engaging, but keep the same meaning and correct answer. Return ONLY a JSON object with fields: questionText, options (array), correctOption (index of correct answer in options array). Do not add explanations or commentary.\n\nInput:\nQuestion: ${questionText}\nOptions: ${JSON.stringify(options)}\nCorrect Option Index: ${correctOption}`;
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 512,
        messages: [
          { role: "system", content: "You are a helpful AI quiz editor." },
          { role: "user", content: prompt },
        ],
      });
      let enhanced;
      try {
        enhanced = JSON.parse(
          extractJSON(completion.choices[0]?.message?.content || "{}"),
        );
      } catch {
        return NextResponse.json(
          { error: "AI response could not be parsed." },
          { status: 500 },
        );
      }
      if (
        !enhanced.questionText ||
        !Array.isArray(enhanced.options) ||
        typeof enhanced.correctOption !== "number"
      ) {
        return NextResponse.json(
          { error: "AI did not return a valid question." },
          { status: 500 },
        );
      }
      return NextResponse.json(
        { question: enhanced },
        {
          headers: { "X-RateLimit-Remaining": String(remaining) },
        },
      );
    } else if (body.action === "generate") {
      const { existingQuestions } = body;
      if (!Array.isArray(existingQuestions) || existingQuestions.length < 4) {
        return NextResponse.json(
          { error: "At least 4 existing questions required." },
          { status: 400 },
        );
      }
      const context = existingQuestions
        .map(
          (q, i) =>
            `Q${i + 1}: ${q.questionText}\nOptions: ${JSON.stringify(
              q.options,
            )}\nCorrect Option Index: ${q.correctOption}`,
        )
        .join("\n\n");
      const prompt = `You are an expert quiz creator for an online learning platform. Given the following 4 multiple-choice questions and their options, generate 4 NEW questions on the same topic, each with 4 options and the correct answer index. Return ONLY a JSON array of 4 objects, each with fields: questionText, options (array), correctOption (index of correct answer in options array). Do not add explanations or commentary.\n\nExisting Questions:\n${context}`;
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 2048,
        messages: [
          { role: "system", content: "You are a helpful AI quiz generator." },
          { role: "user", content: prompt },
        ],
      });
      let questions;
      try {
        questions = JSON.parse(
          extractJSON(completion.choices[0]?.message?.content || "[]"),
        );
      } catch {
        return NextResponse.json(
          { error: "AI response could not be parsed." },
          { status: 500 },
        );
      }
      if (!Array.isArray(questions) || questions.length !== 4) {
        return NextResponse.json(
          { error: "AI did not return 4 questions." },
          { status: 500 },
        );
      }
      return NextResponse.json(
        { questions },
        {
          headers: { "X-RateLimit-Remaining": String(remaining) },
        },
      );
    } else {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }
  } catch (error) {
    console.error("[ENHANCE_QUIZ]", error);
    return NextResponse.json(
      { error: "Failed to process request. Please try again." },
      { status: 500 },
    );
  }
}
