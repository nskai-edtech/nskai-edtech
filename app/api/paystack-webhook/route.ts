import { db } from "@/lib/db";
import { purchases, users, courses } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import crypto from "crypto";

interface PaystackCustomField {
  display_name: string;
  variable_name: string;
  value: string;
}

interface PaystackWebhookCustomer {
  email: string;
  customer_code: string;
}

interface PaystackWebhookMetadata {
  courseId?: string;
  custom_fields?: PaystackCustomField[];
}

interface PaystackWebhookData {
  reference: string;
  amount: number;
  currency: string;
  status: string;
  customer: PaystackWebhookCustomer;
  metadata?: PaystackWebhookMetadata;
}

interface PaystackWebhookEvent {
  event: string;
  data: PaystackWebhookData;
}

function extractCourseId(metadata?: PaystackWebhookMetadata): string | null {
  if (metadata?.courseId) return metadata.courseId;

  const field = metadata?.custom_fields?.find(
    (f) => f.variable_name === "course_id",
  );
  return field?.value ?? null;
}

function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return false;

  const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");

  return hash === signature;
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("x-paystack-signature") || "";

    // Verify webhook signature
    if (!verifySignature(body, signature)) {
      return new Response("Invalid signature", { status: 401 });
    }

    const event: PaystackWebhookEvent = JSON.parse(body);

    // Only process successful charges
    if (event.event !== "charge.success") {
      return new Response("OK", { status: 200 });
    }

    const { reference, amount, customer, metadata } = event.data;

    // Check if this purchase already exists
    const existingPurchase = await db.query.purchases.findFirst({
      where: eq(purchases.paystackReference, reference),
    });

    if (existingPurchase) {
      return new Response("OK", { status: 200 });
    }

    // Resolve the courseId from metadata
    const courseId = extractCourseId(metadata);
    if (!courseId) {
      console.error("[PAYSTACK_WEBHOOK] No courseId in metadata", {
        reference,
      });
      return new Response("OK", { status: 200 });
    }

    // Verify course exists
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
    });

    if (!course) {
      console.error("[PAYSTACK_WEBHOOK] Course not found", { courseId });
      return new Response("OK", { status: 200 });
    }

    // Resolve user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, customer.email),
    });

    if (!user) {
      console.error("[PAYSTACK_WEBHOOK] User not found", {
        email: customer.email,
      });
      return new Response("OK", { status: 200 });
    }

    // Double-check no purchase for this user+course
    const userPurchase = await db.query.purchases.findFirst({
      where: and(
        eq(purchases.userId, user.id),
        eq(purchases.courseId, courseId),
      ),
    });

    if (userPurchase) {
      return new Response("OK", { status: 200 });
    }

    // Create the purchase
    await db.insert(purchases).values({
      userId: user.id,
      courseId: courseId,
      paystackReference: reference,
      amount: amount,
      status: "success",
    });

    console.log("[PAYSTACK_WEBHOOK] Purchase created via webhook", {
      reference,
      courseId,
      userId: user.id,
    });

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("[PAYSTACK_WEBHOOK] Error:", error);

    return new Response("OK", { status: 200 });
  }
}
