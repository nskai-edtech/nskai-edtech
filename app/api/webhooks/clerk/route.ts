import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { users } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  console.log("1. Webhook received");

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

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  console.log("2. Webhook verified. Type:", evt.type);

  const eventType = evt.type;
  if (eventType === "user.created") {
    const { id, email_addresses, image_url } = evt.data;

    console.log("3. Attempting DB Insert for:", id);

    // Default role is LEARNER. We do NOT set ADMIN here.
    // If you need to map metadata (e.g. they selected "Tutor" during signup), you grab it here.
    // const role = evt.data.public_metadata?.role as string || "LEARNER";

    await db.insert(users).values({
      clerkId: id,
      email: email_addresses[0].email_address,
      imageUrl: image_url,
      // We don't have a name field in the schema yet, but if you add one later, use first_name + last_name
    });

    console.log("4. DB Insert Success");

    return NextResponse.json({ message: "User created in DB", user: id });
  }

  if (eventType === "user.updated") {
    const { id, image_url, email_addresses } = evt.data;

    await db
      .update(users)
      .set({
        imageUrl: image_url,
        email: email_addresses[0].email_address,
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

  return new Response("", { status: 200 });
}
