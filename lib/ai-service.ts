/**
 * AI Service — typed helpers for the NSK.AI EdTech AI Core backend.
 *
 * Base URL is read from PYTHON_AI_CHAT_URL (the /api/v1/ai-mentor-chat
 * legacy alias) but we derive the real base from it.
 */

// ─── Types ────────────────────────────────────────────────────────

export interface AiMessage {
  role: string;
  content: string;
}

export interface ChatRequest {
  messages: AiMessage[];
  userId?: string | null;
  skillLevel?: string | null;
  domain?: string | null;
  currentModule?: string | null;
  difficulty?: string | null;
  isInAssessment?: boolean | null;
  allowHomeworkHelp?: boolean;
  strictMode?: boolean;
}

export interface NextStepRecommendation {
  recommendation:
    | "review_prerequisite"
    | "practice_problem"
    | "request_hint"
    | "next_concept";
  reason: string;
  confidence: number;
}

export interface ChatResponse {
  content: string;
  intent?: Record<string, unknown> | null;
  policy?: Record<string, unknown> | null;
  context?: Record<string, unknown> | null;
  audit?: Record<string, unknown> | null;
  metadata?: Record<string, unknown>;
  nextStep?: NextStepRecommendation | null;
}

export type ErrorCategory =
  | "syntax"
  | "logic"
  | "indentation"
  | "naming"
  | "type_error"
  | "off_by_one"
  | "missing_import"
  | "undefined_variable"
  | "infinite_loop"
  | "other";

export interface CodeReviewRequest {
  code: string;
  language?: string;
  studentLevel?: string;
  exerciseId?: string | null;
  conversationId?: string | null;
  userFollowup?: string | null;
}

export interface CodeReviewResponse {
  feedback: string;
  errorCategory?: ErrorCategory | null;
  lineNumber?: number | null;
  confidence: number;
  hintCount: number;
  metadata: Record<string, unknown>;
  conversationId?: string | null;
  hasMoreIssues: boolean;
}

export interface FeedbackRequest {
  userId?: string | null;
  sessionId?: string | null;
  prompt: string;
  response: string;
  conversationTrace?: Record<string, unknown>[];
  rating: number;
  feedbackText?: string | null;
  category?: string | null;
}

export interface FeedbackResponse {
  id: string;
  status: string;
}

export interface GenerateAssetsRequest {
  lessonId: string;
  transcriptUrl: string;
  webhookUrl: string;
}

export interface GenerateAssetsResponse {
  lessonId: string;
  status: string;
  message: string;
}

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Derive the API base URL (e.g. http://host:8000) from the env var.
 * The env var may point at a specific endpoint — we strip the path.
 */
function getBaseUrl(): string {
  const raw =
    process.env.PYTHON_AI_CHAT_URL || "http://localhost:8000/api/v1/ai-mentor-chat";
  try {
    const url = new URL(raw);
    return `${url.protocol}//${url.host}`;
  } catch {
    return "http://localhost:8000";
  }
}

function headers(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "x-ai-secret": process.env.AI_WEBHOOK_SECRET || "",
  };
}

// ─── AI Mentor Chat ──────────────────────────────────────────────

/** Non-streaming chat — full response at once. */
export async function aiMentorChat(body: ChatRequest): Promise<ChatResponse> {
  const res = await fetch(`${getBaseUrl()}/api/v1/ai-mentor/chat`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`AI Mentor chat error: ${res.status}`);
  return res.json();
}

/** Streaming chat — returns the raw Response so callers can pipe the SSE body. */
export async function aiMentorChatStream(body: ChatRequest): Promise<Response> {
  const res = await fetch(`${getBaseUrl()}/api/v1/ai-mentor/chat/stream`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`AI Mentor stream error: ${res.status}`);
  return res;
}

// ─── Code Reviewer ───────────────────────────────────────────────

export async function reviewCode(
  body: CodeReviewRequest,
): Promise<CodeReviewResponse> {
  const res = await fetch(`${getBaseUrl()}/api/v1/reviewer/review`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Code review error: ${res.status}`);
  return res.json();
}

// ─── Feedback ────────────────────────────────────────────────────

export async function submitFeedback(
  body: FeedbackRequest,
): Promise<FeedbackResponse> {
  const res = await fetch(`${getBaseUrl()}/api/v1/feedback`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Feedback error: ${res.status}`);
  return res.json();
}

// ─── Lesson Asset Generation ─────────────────────────────────────

export async function generateLessonAssets(
  body: GenerateAssetsRequest,
): Promise<GenerateAssetsResponse> {
  const res = await fetch(`${getBaseUrl()}/api/v1/lesson-assets/generate`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Asset generation error: ${res.status}`);
  return res.json();
}

// ─── Health ──────────────────────────────────────────────────────

export async function aiMentorHealth(): Promise<Record<string, unknown>> {
  const res = await fetch(`${getBaseUrl()}/api/v1/ai-mentor/health`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(`Health check error: ${res.status}`);
  return res.json();
}
