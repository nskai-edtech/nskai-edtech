import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface LocalChatMessage {
  role: "system" | "user" | "ai";
  content: string;
}

export async function localMentorChat(
  messages: LocalChatMessage[],
): Promise<string> {
  // Translate "ai" back to "assistant" for Groq
  const formattedMessages = messages.map((msg) => ({
    role: (msg.role === "ai" ? "assistant" : msg.role) as
      | "system"
      | "user"
      | "assistant",
    content: msg.content,
  }));

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.6,
    max_tokens: 2048,
    messages: formattedMessages,
  });

  return completion.choices[0]?.message?.content?.trim() ?? "";
}

export async function localMentorChatStream(
  messages: LocalChatMessage[],
): Promise<ReadableStream<Uint8Array>> {
  // Translate "ai" back to "assistant" for Groq
  const formattedMessages = messages.map((msg) => ({
    role: (msg.role === "ai" ? "assistant" : msg.role) as
      | "system"
      | "user"
      | "assistant",
    content: msg.content,
  }));

  const stream = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.6,
    max_tokens: 2048,
    stream: true,
    messages: formattedMessages, // Send the translated messages
  });

  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) {
            controller.enqueue(encoder.encode(delta));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}
