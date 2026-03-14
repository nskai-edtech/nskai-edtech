import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getGroq } from "@/lib/groq";
import { createRateLimiter, createIpRateLimiter } from "@/lib/rate-limit";

// ── Types ──
interface QuizQuestion {
  questionText: string;
  options: string[];
  correctOption: number;
}

// ── Initializations ──
// 10 user requests per 60-second window
const userRateLimiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 });
// 20 IP requests per 10-second window (matches previous Upstash config)
const ipRateLimiter = createIpRateLimiter({ maxRequests: 20, windowMs: 10_000 });

export async function POST(req: Request) {
  try {
    // IP Rate Limiting (Block bots instantly)
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

    // 2. Authentication
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 3. User Rate Limiting
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

    const body = await req.json();

    // ── ACTION: ENHANCE QUESTION ──
    if (body.action === "enhance") {
      const { questionText, options, correctOption } = body as QuizQuestion;

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

      const prompt = `You are an expert quiz editor. Rewrite the following multiple-choice question and options to be clearer and engaging, keeping the same meaning and correct answer. 
      You MUST return a JSON object with this exact structure: {"questionText": "...", "options": ["..."], "correctOption": 0}.
      
      Input:
      Question: ${questionText}
      Options: ${JSON.stringify(options)}
      Correct Option Index: ${correctOption}`;

      const completion = await getGroq().chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 512,
        response_format: { type: "json_object" }, // Forces valid JSON output
        messages: [
          {
            role: "system",
            content: "You are a helpful AI quiz editor. Always output in JSON.",
          },
          { role: "user", content: prompt },
        ],
      });

      // No more regex needed! We can safely parse immediately.
      const enhanced: QuizQuestion = JSON.parse(
        completion.choices[0]?.message?.content || "{}",
      );

      if (
        !enhanced.questionText ||
        !Array.isArray(enhanced.options) ||
        typeof enhanced.correctOption !== "number"
      ) {
        return NextResponse.json(
          { error: "AI generated an invalid structure." },
          { status: 500 },
        );
      }

      return NextResponse.json(
        { question: enhanced },
        { headers: { "X-RateLimit-Remaining": String(remaining) } },
      );
    }

    // ── ACTION: GENERATE NEW QUESTIONS ──
    else if (body.action === "generate") {
      const { existingQuestions } = body;

      if (!Array.isArray(existingQuestions) || existingQuestions.length < 4) {
        return NextResponse.json(
          { error: "At least 4 existing questions required." },
          { status: 400 },
        );
      }

      const context = existingQuestions
        .map(
          (q: QuizQuestion, i) =>
            `Q${i + 1}: ${q.questionText}\nOptions: ${JSON.stringify(q.options)}\nCorrect Option Index: ${q.correctOption}`,
        )
        .join("\n\n");

      const prompt = `You are an expert quiz creator. Given the following 4 questions, generate 4 NEW, DISTINCT questions on the same overall subject. 
      
      CRITICAL INSTRUCTION: The new questions MUST cover completely different concepts, facts, or angles than the existing questions. DO NOT create mere variations or rewordings of the existing questions. Test different areas of the student's knowledge.
      
      You MUST return a JSON object with a single key "questions" containing an array of 4 objects. Each object must have fields: questionText, options (array), and correctOption (number).
      
      Existing Questions:
      ${context}`;

      const completion = await getGroq().chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 2048,
        response_format: { type: "json_object" }, // Forces valid JSON output
        messages: [
          {
            role: "system",
            content:
              "You are a helpful AI quiz generator. Always output in JSON format.",
          },
          { role: "user", content: prompt },
        ],
      });

      const parsedData = JSON.parse(
        completion.choices[0]?.message?.content || "{}",
      );
      const questions = parsedData.questions; // We access the array inside the JSON object

      if (!Array.isArray(questions) || questions.length !== 4) {
        return NextResponse.json(
          { error: "AI did not return exactly 4 questions." },
          { status: 500 },
        );
      }

      return NextResponse.json(
        { questions },
        { headers: { "X-RateLimit-Remaining": String(remaining) } },
      );
    }

    // ── INVALID ACTION ──
    else {
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
