import Mux from "@mux/mux-node";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { muxData } from "@/drizzle/schema";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
});

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headerPayload = await headers();
    const signature = headerPayload.get("mux-signature");

    if (!signature) {
      console.error("[MUX_WEBHOOK] No signature found in headers");
      return new Response("No signature", { status: 400 });
    }

    const webhookSecret = process.env.MUX_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn(
        "[MUX_WEBHOOK] MUX_WEBHOOK_SECRET is not set. Skipping verification.",
      );
    } else {
      try {
        mux.webhooks.verifySignature(
          body,
          { "mux-signature": signature },
          webhookSecret,
        );
      } catch (err) {
        console.error("[MUX_WEBHOOK] Signature verification failed:", err);
        return new Response("Invalid signature", { status: 400 });
      }
    }

    const jsonBody = JSON.parse(body);
    const { type, data } = jsonBody;

    console.log(`[MUX_WEBHOOK] Received event: ${type}`);

    if (type === "video.asset.ready") {
      const lessonId = data.passthrough;
      const assetId = data.id;
      const playbackId = data.playback_ids?.[0]?.id;

      if (!lessonId) {
        console.error("[MUX_WEBHOOK] No passthrough (lessonId) found in data");
        return Response.json({ message: "LessonId missing" }, { status: 400 });
      }

      console.log(
        `[MUX_WEBHOOK] Saving asset ${assetId} for lesson ${lessonId}`,
      );

      // Update or insert mux data for this lesson
      await db
        .insert(muxData)
        .values({
          lessonId,
          assetId,
          playbackId,
        })
        .onConflictDoUpdate({
          target: muxData.lessonId,
          set: {
            assetId,
            playbackId,
          },
        });

      console.log("[MUX_WEBHOOK] Database updated successfully");
    }

    return Response.json({ message: "ok" });
  } catch (error) {
    console.error("[MUX_WEBHOOK_ERROR]", error);
    return Response.json({ message: "Internal Error" }, { status: 500 });
  }
}
