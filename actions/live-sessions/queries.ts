"use server";

import { auth } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";

import { liveSessions } from "@/drizzle/schema/live-sessions";
import { users } from "@/drizzle/schema/users";
import { db } from "@/lib/db";
import {requireTutorUser} from "@/actions/live-sessions/auth";


export async function getTutorLiveSessions() {
  const tutor = await requireTutorUser();

  return db.query.liveSessions.findMany({
    where: eq(liveSessions.hostId, tutor.id),
    orderBy: [desc(liveSessions.createdAt)],
  });
}

export async function getTutorLiveSessionById(sessionId: string) {
  const tutor = await requireTutorUser();

  return db.query.liveSessions.findFirst({
    where: and(
      eq(liveSessions.id, sessionId),
      eq(liveSessions.hostId, tutor.id),
    ),
  });
}

export async function getTutorLiveSessionInvite(sessionId: string) {
  const tutor = await requireTutorUser();

  return db.query.liveSessions.findFirst({
    where: and(
      eq(liveSessions.id, sessionId),
      eq(liveSessions.hostId, tutor.id),
    ),
    columns: {
      id: true,
      title: true,
      channelName: true,
      status: true,
      guestAccessEnabled: true,
      guestInviteCode: true,
      guestInviteRotatedAt: true,
      guestInviteExpiresAt: true,
      startsAt: true,
      actualEndedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}