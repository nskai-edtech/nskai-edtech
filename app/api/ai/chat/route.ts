import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createRateLimiter } from "@/lib/rate-limit";
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

// 20 messages per 60-second window per user
const rateLimiter = createRateLimiter({ maxRequests: 20, windowMs: 60_000 });

export async function POST(req: Request) {
  try {
    // ── Auth ──
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // ── Rate limit ──
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

    // ── Fetch lesson context so the AI knows what the student is watching ──
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

          if (lesson.description)
            parts.push(`Lesson description: ${lesson.description}`);
          if (lesson.notes) {
            parts.push(`Lesson notes/transcript:\n${lesson.notes}`);
            hasTranscriptOrNotes = true;
          } else {
            // No tutor-provided notes — try to fetch auto-generated Mux transcript
            try {
              const mux = await db.query.muxData.findFirst({
                where: eq(muxData.lessonId, lessonId),
                columns: { assetId: true },
              });
              if (mux?.assetId) {
                const transcript = await fetchMuxTranscript(mux.assetId);
                if (transcript) {
                  parts.push(`Video transcript:\n${transcript}`);
                  hasTranscriptOrNotes = true;

                  // Cache transcript in lesson.notes for future requests
                  try {
                    await db
                      .update(lessons)
                      .set({ notes: `[AUTO-TRANSCRIPT]\n${transcript}` })
                      .where(eq(lessons.id, lesson.id));
                    console.log(
                      `[AI_CHAT] Cached Mux transcript for lesson ${lessonId} (${transcript.length} chars)`,
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

          lessonContext = parts.join("\n");
          console.log(
            `[AI_CHAT] Built lesson context for ${lessonId}: ${lessonContext.length} chars, hasTranscript=${hasTranscriptOrNotes}, hasDescription=${!!lesson.description}`,
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

    // ── Build the full message history for the AI Core ──
    // The new AI backend requires the full conversation history each request.
    const aiMessages: { role: string; content: string }[] = [];

    // Inject lesson context as a system message so the AI knows the lesson
    if (lessonContext && hasTranscriptOrNotes) {
      // Full context available — AI has transcript/notes to reference
      aiMessages.push({
        role: "system",
        content: `You are an AI Mentor helping a student who is currently watching a video lesson. Here is the context for the lesson they are viewing:\n\n${lessonContext}\n\nUse this context to answer their questions accurately. If they ask about the video or lesson content, reference the information above. Be helpful, concise, and educational.`,
      });
    } else if (lessonContext) {
      // Only metadata available — no transcript or notes
      aiMessages.push({
        role: "system",
        content: `You are an AI Mentor helping a student who is currently watching a video lesson. Here is what we know about the lesson:\n\n${lessonContext}\n\nNote: The full video transcript is not currently available, so you only have the lesson title and course metadata above. Do your best to help the student based on this information. If they ask about specific video content you cannot see, be honest and say you don't have access to the full video transcript yet, but offer to help with the topic based on your general knowledge. Be helpful, concise, and educational.`,
      });
    } else {
      // No lesson context at all (lessonId not provided or DB lookup failed)
      aiMessages.push({
        role: "system",
        content:
          "You are an AI Mentor for an online learning platform. Help the student with their questions. Be helpful, concise, educational, and supportive. If they ask about a specific video or lesson, let them know you don't currently have context about the specific lesson they are viewing but you can still help with the topic.",
      });
    }

    if (lessonContext) {
      aiMessages.push({
        role: "user",
        content: `[LESSON CONTEXT — please use this to help me]\n\n${lessonContext}\n\nPlease use the above lesson context (including any transcript or notes) to help answer my questions about this video lesson.`,
      });
      aiMessages.push({
        role: "assistant",
        content: `Got it! I have the full context for this lesson. I can see the lesson details${hasTranscriptOrNotes ? " and the video transcript" : ""}. Feel free to ask me anything about this lesson and I'll reference the content to help you.`,
      });
    }

    if (clientMessages && Array.isArray(clientMessages)) {
      for (const m of clientMessages) {
        if (m.content?.startsWith?.("[LESSON CONTEXT")) continue;
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
      (m) => m.role === "user" && m.content.startsWith("[LESSON CONTEXT"),
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
        role: (m.role === "assistant"
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

    /**
     * The AI Core streams structured SSE events:
     *   data: {"type":"status","payload":{"step":"..."}}
     *   data: {"type":"token","payload":{"delta":"..."}}
     *   data: {"type":"metadata","payload":{...}}
     *   data: {"type":"done"}
     *
     * We parse these and forward only the token deltas as plain text
     * so the frontend can simply append chunks to the message bubble.
     */
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
