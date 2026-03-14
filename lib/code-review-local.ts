/**
 * Local Groq-powered code reviewer — used as a fallback when the Python
 * AI backend is unreachable or returns a low-confidence fallback response.
 * Uses Llama 3.3 70B via Groq's free tier (30 req/min, 6000 tokens/min).
 */

import { getGroq } from "@/lib/groq";
import type {
  CodeReviewRequest,
  CodeReviewResponse,
  ErrorCategory,
} from "./ai-service";

const SYSTEM_PROMPT = `You are an expert code reviewer for an educational platform.
Your role is to help students learn by reviewing their code thoroughly.

RULES:
1. Identify issues and explain them clearly.
2. For each issue, provide a Socratic hint AND a concrete fix suggestion.
3. Be encouraging but honest.
4. If the code is correct, say so clearly and suggest improvements if any.
5. Adjust your language complexity to match the student's level.
6. When pointing out an issue, show the corrected code snippet in your feedback.

Format your feedback like:
- First explain what the issue is
- Then show the suggested fix (use inline code)
- Optionally ask a guiding question to deepen understanding

You MUST respond with valid JSON matching this exact schema:
{
  "feedback": "Your feedback with explanation and suggested fix as a string",
  "errorCategory": "syntax" | "logic" | "indentation" | "naming" | "type_error" | "off_by_one" | "missing_import" | "undefined_variable" | "infinite_loop" | "other" | null,
  "lineNumber": <number or null>,
  "confidence": <number between 0 and 1>,
  "hintCount": 1,
  "hasMoreIssues": <true if there are additional issues beyond this one>
}

ONLY output the JSON. No markdown, no code fences, no extra text.`;

function buildUserPrompt(req: CodeReviewRequest): string {
  const parts: string[] = [];

  parts.push(`Language: ${req.language ?? "python"}`);
  parts.push(`Student level: ${req.studentLevel ?? "intermediate"}`);

  if (req.userFollowup) {
    parts.push(`\nStudent's follow-up question: ${req.userFollowup}`);
    parts.push(`\nCode being discussed:\n\`\`\`\n${req.code}\n\`\`\``);
  } else {
    parts.push(`\nPlease review this code:\n\`\`\`\n${req.code}\n\`\`\``);
  }

  return parts.join("\n");
}

/**
 * Perform a code review using Groq (Llama 3.3 70B) directly.
 * Returns a CodeReviewResponse matching the same shape as the Python backend.
 */
export async function reviewCodeLocal(
  req: CodeReviewRequest,
): Promise<CodeReviewResponse> {
  const completion = await getGroq().chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.4,
    max_tokens: 1024,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(req) },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? "";

  // Parse the JSON response from the model
  let parsed: Record<string, unknown>;
  try {
    // Strip markdown code fences if the model included them
    const cleaned = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    parsed = JSON.parse(cleaned);
  } catch {
    // If parsing fails, return the raw text as feedback
    return {
      feedback: raw || "I couldn't analyze this code. Please try again.",
      errorCategory: null,
      lineNumber: null,
      confidence: 0.5,
      hintCount: 1,
      metadata: { source: "groq-fallback", parseError: true },
      hasMoreIssues: false,
    };
  }

  return {
    feedback: String(parsed.feedback ?? "No feedback generated."),
    errorCategory: (parsed.errorCategory as ErrorCategory) ?? null,
    lineNumber:
      typeof parsed.lineNumber === "number" ? parsed.lineNumber : null,
    confidence:
      typeof parsed.confidence === "number"
        ? Math.min(1, Math.max(0, parsed.confidence))
        : 0.7,
    hintCount: typeof parsed.hintCount === "number" ? parsed.hintCount : 1,
    metadata: { source: "groq-fallback" },
    conversationId: req.conversationId ?? null,
    hasMoreIssues: Boolean(parsed.hasMoreIssues),
  };
}

/**
 * Returns true if the response looks like a backend fallback
 * (low confidence + generic "having trouble" message).
 */
export function isLowQualityFallback(res: CodeReviewResponse): boolean {
  const troublePhrases = [
    "having trouble",
    "trouble providing feedback",
    "could you explain",
    "i'm not sure",
    "unable to review",
  ];
  const feedbackLower = res.feedback.toLowerCase();
  return (
    res.confidence <= 0.4 &&
    troublePhrases.some((p) => feedbackLower.includes(p))
  );
}
