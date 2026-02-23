import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local",
    );
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  const payload = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred during verification", {
      status: 400,
    });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const {
      id,
      email_addresses,
      image_url,
      first_name,
      last_name,
      public_metadata,
    } = evt.data;

    const role =
      (public_metadata?.role as "LEARNER" | "TUTOR" | "ADMIN") || "LEARNER";
    const status =
      (public_metadata?.status as
        | "ACTIVE"
        | "PENDING"
        | "REJECTED"
        | "SUSPENDED"
        | "BANNED") || "ACTIVE";

    await db
      .insert(users)
      .values({
        clerkId: id,
        email: email_addresses?.[0]?.email_address || "",
        imageUrl: image_url,
        firstName: first_name,
        lastName: last_name,
        role,
        status,
      })
      .onConflictDoUpdate({
        target: [users.clerkId],
        set: {
          email: email_addresses?.[0]?.email_address || "",
          imageUrl: image_url,
          firstName: first_name,
          lastName: last_name,
          role,
          status,
        },
      });

    return NextResponse.json({ message: "User synced in DB", user: id });
  }

  if (eventType === "user.updated") {
    const { id, image_url, email_addresses, first_name, last_name } = evt.data;

    await db
      .update(users)
      .set({
        imageUrl: image_url,
        email: email_addresses?.[0]?.email_address || "",
        firstName: first_name,
        lastName: last_name,
      })
      .where(eq(users.clerkId, id));

    return NextResponse.json({ message: "User updated in DB", user: id });
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    if (id) {
      await db.delete(users).where(eq(users.clerkId, id));
    }

    return NextResponse.json({ message: "User deleted from DB", user: id });
  }

  return new Response("Webhook processed", { status: 200 });
}
