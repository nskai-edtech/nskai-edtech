import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createRateLimiter, createIpRateLimiter } from "@/lib/rate-limit";
import { db } from "@/lib/db";
import {
  aiChatConversations,
  aiChatMessages,
  users,
  lessons,
  chapters,
  courses,
  muxData,
} from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { aiMentorChatStream, type ChatRequest } from "@/lib/ai-service";
import { fetchMuxTranscript } from "@/lib/mux-transcript";
import { localMentorChatStream, type LocalChatMessage } from "@/lib/chat-local";

// 10 IP requests per 10-second window (matches previous Upstash config)
const ipRateLimiter = createIpRateLimiter({ maxRequests: 10, windowMs: 10_000 });
// 20 messages per 60-second window per user
const rateLimiter = createRateLimiter({ maxRequests: 20, windowMs: 60_000 });

export async function POST(req: Request) {
  try {
    // ── IP Rate limit ──
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

    // ── Auth ──
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // ── User Rate limit ──
    const { allowed, remaining, resetInMs } = rateLimiter(clerkId);
    if (!allowed) {
      return NextResponse.json(
        {
          error:
            "Too many requests. Please wait before sending another message.",
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

    const {
      lessonId,
      message,
      conversationId,
      messages: clientMessages,
      skillLevel,
      domain,
      currentModule,
      difficulty,
      isInAssessment,
    } = await req.json();

    if (!message) {
      return new NextResponse("Missing message", { status: 400 });
    }

    let lessonContext: string | null = null;
    let hasTranscriptOrNotes = false;
    if (lessonId) {
      try {
        const lesson = await db.query.lessons.findFirst({
          where: eq(lessons.id, lessonId),
          columns: {
            id: true,
            title: true,
            description: true,
            notes: true,
            transcript: true,
            chapterId: true,
          },
        });

        if (lesson) {
          const parts: string[] = [];
          parts.push(`Lesson title: ${lesson.title}`);

          // Get chapter & course info for broader context
          if (lesson.chapterId) {
            const chapter = await db.query.chapters.findFirst({
              where: eq(chapters.id, lesson.chapterId),
              columns: { title: true, courseId: true },
            });
            if (chapter) {
              parts.push(`Chapter: ${chapter.title}`);
              if (chapter.courseId) {
                const course = await db.query.courses.findFirst({
                  where: eq(courses.id, chapter.courseId),
                  columns: { title: true, description: true },
                });
                if (course) {
                  parts.push(`Course: ${course.title}`);
                  if (course.description)
                    parts.push(`Course description: ${course.description}`);
                }
              }
            }
          }

          // ── Lesson description ──
          if (lesson.description)
            parts.push(`Lesson description: ${lesson.description}`);

          // ── Tutor-provided notes (always include if present) ──
          if (lesson.notes) {
            parts.push(`Tutor's lesson notes:\n${lesson.notes}`);
            hasTranscriptOrNotes = true;
          }

          // ── Video transcript (dedicated column) ──
          let transcriptText = lesson.transcript;

          if (!transcriptText) {
            // No cached transcript — try to fetch from Mux
            try {
              const mux = await db.query.muxData.findFirst({
                where: eq(muxData.lessonId, lessonId),
                columns: { assetId: true },
              });
              if (mux?.assetId) {
                const fetched = await fetchMuxTranscript(mux.assetId);
                if (fetched) {
                  transcriptText = fetched;
                  // Cache in the dedicated transcript column for future requests
                  try {
                    await db
                      .update(lessons)
                      .set({ transcript: fetched })
                      .where(eq(lessons.id, lesson.id));
                    console.log(
                      `[AI_CHAT] Cached Mux transcript for lesson ${lessonId} (${fetched.length} chars)`,
                    );
                  } catch (cacheErr) {
                    console.error(
                      "[AI_CHAT] Failed to cache transcript:",
                      cacheErr,
                    );
                  }
                } else {
                  console.warn(
                    `[AI_CHAT] No transcript available from Mux for lesson ${lessonId}`,
                  );
                }
              } else {
                console.warn(
                  `[AI_CHAT] No Mux asset found for lesson ${lessonId}`,
                );
              }
            } catch (txErr) {
              console.error("[MUX_TRANSCRIPT_FETCH]", txErr);
            }
          }

          if (transcriptText) {
            parts.push(`Video transcript:\n${transcriptText}`);
            hasTranscriptOrNotes = true;
          }

          lessonContext = parts.join("\n");
          console.log(
            `[AI_CHAT] Built lesson context for ${lessonId}: ${lessonContext.length} chars, hasTranscript=${!!transcriptText}, hasNotes=${!!lesson.notes}, hasDescription=${!!lesson.description}`,
          );
        } else {
          console.warn(`[AI_CHAT] Lesson not found in DB: ${lessonId}`);
        }
      } catch (err) {
        console.error("[AI_CHAT_LESSON_CONTEXT]", err);
        // Non-fatal — continue without lesson context
      }
    }

    // ── Persist user message if conversationId is provided ──
    let verifiedConversationId: string | null = null;
    if (conversationId) {
      const user = await db.query.users.findFirst({
        where: eq(users.clerkId, clerkId),
        columns: { id: true },
      });

      if (user) {
        const conversation = await db.query.aiChatConversations.findFirst({
          where: and(
            eq(aiChatConversations.id, conversationId),
            eq(aiChatConversations.userId, user.id),
          ),
        });

        if (conversation) {
          verifiedConversationId = conversation.id;

          // Save the user message
          await db.insert(aiChatMessages).values({
            conversationId: verifiedConversationId,
            role: "user",
            content: message,
          });
        }
      }
    }

    const aiMessages: { role: string; content: string }[] = [];

    if (lessonContext && hasTranscriptOrNotes) {
      aiMessages.push({
        role: "system",
        content: `You are an AI Mentor helping a student who is currently learning from a video lesson. Below is all the available context for the lesson they are watching. It may include a video transcript, the tutor's lesson notes, and course/lesson descriptions.\n\n${lessonContext}\n\nIMPORTANT INSTRUCTIONS:\n- Use ALL of these sources together to understand the lesson topic and help the student.\n- The video transcript captures what was spoken in the video. The tutor's notes and descriptions provide the tutor's own summary or outline. They are complementary — one may contain details the other does not.\n- Do NOT compare or contrast these sources for consistency. Never tell the student that the transcript does not match the notes, or that a topic appears in one source but not another.\n- Synthesise all available information into a single coherent understanding of the lesson, and use it alongside your general knowledge to give the most helpful answer.\n- Be educational, concise, and supportive.`,
      });
    } else if (lessonContext) {
      aiMessages.push({
        role: "system",
        content: `You are an AI Mentor helping a student who is currently learning from a video lesson. Below is the available metadata for the lesson:\n\n${lessonContext}\n\nUse this information along with your general knowledge of the topic to help the student as fully as possible. Be educational, concise, and supportive.`,
      });
    } else {
      aiMessages.push({
        role: "system",
        content:
          "You are an AI Mentor for an online learning platform. Help the student with their questions using your knowledge. Be educational, concise, and supportive.",
      });
    }

    if (lessonContext) {
      aiMessages.push({
        role: "user",
        content: `[LESSON MATERIALS — use all of these to help me]\n\n${lessonContext}\n\nPlease use all the above lesson materials together to help answer my questions about this video lesson.`,
      });
      aiMessages.push({
        role: "ai",
        content:
          "Got it! I have the available materials for this lesson. Ask me anything and I'll reference what I know to help you.",
      });
    }

    if (clientMessages && Array.isArray(clientMessages)) {
      for (const m of clientMessages) {
        if (
          m.content?.startsWith?.("[LESSON CONTEXT") ||
          m.content?.startsWith?.("[LESSON MATERIALS")
        )
          continue;
        aiMessages.push({
          role: m.role === "ai" ? "assistant" : m.role,
          content: m.content,
        });
      }
    }

    // Always ensure the latest user message is included
    const lastMsg = aiMessages[aiMessages.length - 1];
    if (!lastMsg || lastMsg.content !== message || lastMsg.role !== "user") {
      aiMessages.push({ role: "user", content: message });
    }

    // ── Forward to the AI Core streaming endpoint ──
    const chatPayload: ChatRequest = {
      messages: aiMessages,
      userId: clerkId,
      skillLevel: skillLevel ?? null,
      domain: domain ?? null,
      currentModule: currentModule ?? null,
      difficulty: difficulty ?? null,
      isInAssessment: isInAssessment ?? false,
    };

    // Debug: log what the AI will receive
    const systemMsg = aiMessages.find((m) => m.role === "system");
    const contextUserMsg = aiMessages.find(
      (m) =>
        m.role === "user" &&
        (m.content.startsWith("[LESSON CONTEXT") ||
          m.content.startsWith("[LESSON MATERIALS")),
    );
    console.log(
      `[AI_CHAT] Messages to AI: ${aiMessages.length} total, hasSystem=${!!systemMsg}, hasContextInjection=${!!contextUserMsg}`,
    );
    if (systemMsg) {
      console.log(
        `[AI_CHAT] System prompt (first 300 chars): ${systemMsg.content.slice(0, 300)}...`,
      );
    }

    let pythonResponse: Response | null = null;
    let useFallback = false;

    try {
      pythonResponse = await aiMentorChatStream(chatPayload);
      if (!pythonResponse.ok) {
        console.warn(
          "[AI_CHAT] Python backend returned",
          pythonResponse.status,
        );
        useFallback = true;
      }
    } catch (err) {
      console.warn(
        "[AI_CHAT] Python backend unreachable, falling back to Groq:",
        err,
      );
      useFallback = true;
    }

    // Determine context quality for the client
    const contextQuality = hasTranscriptOrNotes
      ? "full"
      : lessonContext
        ? "partial"
        : "none";

    const responseHeaders = {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-RateLimit-Remaining": String(remaining),
      "X-Lesson-Context": contextQuality,
    };

    // ── Groq fallback path ──
    if (useFallback || !pythonResponse?.body) {
      const groqMessages: LocalChatMessage[] = aiMessages.map((m) => ({
        role: (m.role === "ai"
          ? "assistant"
          : m.role === "system"
            ? "system"
            : "user") as LocalChatMessage["role"],
        content: m.content,
      }));

      // Ensure there's a system prompt even if no lesson context
      if (!groqMessages.some((m) => m.role === "system")) {
        groqMessages.unshift({
          role: "system",
          content:
            "You are a helpful AI Mentor for an online learning platform. Help the student with their questions. Be concise, educational, and supportive.",
        });
      }

      const groqStream = await localMentorChatStream(groqMessages);

      // Persist AI response for Groq fallback
      if (verifiedConversationId) {
        const convId = verifiedConversationId;
        let fullAiResponse = "";

        const captureStream = new TransformStream<Uint8Array, Uint8Array>({
          transform(chunk, controller) {
            fullAiResponse += new TextDecoder().decode(chunk);
            controller.enqueue(chunk);
          },
          async flush() {
            if (fullAiResponse.trim()) {
              try {
                await db.insert(aiChatMessages).values({
                  conversationId: convId,
                  role: "ai",
                  content: fullAiResponse,
                });
                await db
                  .update(aiChatConversations)
                  .set({ updatedAt: new Date() })
                  .where(eq(aiChatConversations.id, convId));
              } catch (err) {
                console.error("[AI_CHAT_SAVE_ERROR]", err);
              }
            }
          },
        });

        groqStream.pipeTo(captureStream.writable);
        return new Response(captureStream.readable, {
          headers: responseHeaders,
        });
      }

      return new Response(groqStream, { headers: responseHeaders });
    }

    function createSseParserStream(onText: (text: string) => void) {
      const encoder = new TextEncoder();
      let buffer = "";

      return new TransformStream<Uint8Array, Uint8Array>({
        transform(chunk, controller) {
          buffer += new TextDecoder().decode(chunk);

          // Process complete lines (SSE lines end with \n)
          const lines = buffer.split("\n");
          // Keep the last partial line in the buffer
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;

            const jsonStr = trimmed.slice(5).trim();
            if (!jsonStr) continue;

            try {
              const event = JSON.parse(jsonStr);

              if (event.type === "token" && event.payload?.delta) {
                const delta = event.payload.delta as string;
                onText(delta);
                controller.enqueue(encoder.encode(delta));
              }
              // status, metadata, done events are silently consumed
            } catch {
              // Not valid JSON — skip (could be a keep-alive comment)
            }
          }
        },
        flush(controller) {
          // Process any remaining data in the buffer
          if (buffer.trim().startsWith("data:")) {
            const jsonStr = buffer.trim().slice(5).trim();
            try {
              const event = JSON.parse(jsonStr);
              if (event.type === "token" && event.payload?.delta) {
                const delta = event.payload.delta as string;
                onText(delta);
                controller.enqueue(encoder.encode(delta));
              }
            } catch {
              // ignore
            }
          }
        },
      });
    }

    // If we have a verified conversation, capture the full AI response to persist it
    if (verifiedConversationId && pythonResponse.body) {
      const convId = verifiedConversationId;
      let fullAiResponse = "";

      const parserStream = createSseParserStream((delta) => {
        fullAiResponse += delta;
      });

      // When the stream finishes, save the complete response
      const saveStream = new TransformStream<Uint8Array, Uint8Array>({
        transform(chunk, controller) {
          controller.enqueue(chunk);
        },
        async flush() {
          if (fullAiResponse.trim()) {
            try {
              await db.insert(aiChatMessages).values({
                conversationId: convId,
                role: "ai",
                content: fullAiResponse,
              });
              await db
                .update(aiChatConversations)
                .set({ updatedAt: new Date() })
                .where(eq(aiChatConversations.id, convId));
            } catch (err) {
              console.error("[AI_CHAT_SAVE_ERROR]", err);
            }
          }
        },
      });

      pythonResponse.body.pipeThrough(parserStream).pipeTo(saveStream.writable);

      return new Response(saveStream.readable, { headers: responseHeaders });
    }

    // No conversation to persist — just parse and forward tokens
    if (pythonResponse.body) {
      const parserStream = createSseParserStream(() => {});
      pythonResponse.body.pipeTo(parserStream.writable);
      return new Response(parserStream.readable, { headers: responseHeaders });
    }

    return new Response(pythonResponse.body, { headers: responseHeaders });
  } catch (error) {
    console.error("[AI_CHAT_PROXY_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
