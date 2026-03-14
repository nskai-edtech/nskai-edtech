import { RtcRole, RtcTokenBuilder } from "agora-access-token";
import { and, eq, gt, isNull, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { liveSessions } from "@/drizzle/schema/live-sessions";
import { db } from "@/lib/db";
import { generateAgoraGuestUid } from "@/lib/live/invite";
import { checkGuestTokenRateLimit } from "@/lib/live/guest-token-rate-limit";

const requestSchema = z.object({
  guestInviteCode: z.string().trim().min(20).max(128),
  displayName: z.string().trim().min(2).max(60),
});

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return "unknown";
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const { guestInviteCode, displayName } = parsed.data;

    const rateLimitKey = `guest-token:${ip}:${guestInviteCode}`;
    const rateLimit = await checkGuestTokenRateLimit(rateLimitKey);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests. Please try again shortly.",
          resetInMs: rateLimit.resetInMs,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(rateLimit.resetInMs / 1000)),
          },
        },
      );
    }

    const session = await db.query.liveSessions.findFirst({
      where: and(
        eq(liveSessions.guestInviteCode, guestInviteCode),
        eq(liveSessions.guestAccessEnabled, true),
        eq(liveSessions.status, "LIVE"),
        isNull(liveSessions.actualEndedAt),
        or(
          isNull(liveSessions.guestInviteExpiresAt),
          gt(liveSessions.guestInviteExpiresAt, new Date()),
        ),
      ),
      columns: {
        id: true,
        channelName: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Invalid or expired guest invite" },
        { status: 404 },
      );
    }

    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
      console.error("[LIVE_GUEST_TOKEN_MISSING_AGORA_ENV]");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const uid = generateAgoraGuestUid();
    const currentTs = Math.floor(Date.now() / 1000);
    const expiresAt = currentTs + 60 * 60;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      session.channelName,
      uid,
      RtcRole.PUBLISHER,
      expiresAt,
    );

    return NextResponse.json({
      token,
      uid,
      channelName: session.channelName,
      role: "broadcaster",
      displayName,
      expiresAt,
      rateLimit: {
        remaining: rateLimit.remaining,
        resetInMs: rateLimit.resetInMs,
      },
    });
  } catch (error) {
    console.error("[POST_LIVE_GUEST_TOKEN_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to generate guest token" },
      { status: 500 },
    );
  }
}