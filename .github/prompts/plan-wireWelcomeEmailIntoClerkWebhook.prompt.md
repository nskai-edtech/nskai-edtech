# Wire WelcomeEmail into the Clerk Webhook

## Context

- **WelcomeEmail** (`emails/WelcomeEmail.tsx`) accepts `{ name: string; role?: "TUTOR" | "LEARNER" }` and renders a role-aware welcome message via `@react-email/components`.
- **sendEmail** (`lib/email.ts`) wraps Resend and accepts `{ to, subject, react }`.
- **Clerk webhook** (`app/api/webhooks/clerk/route.ts`) handles `user.created`, `user.updated`, and `user.deleted` events. The `user.created` handler upserts into the `users` table but does **not** send any email yet.

## Changes

### 1. Add imports

Add to `app/api/webhooks/clerk/route.ts`:

```ts
import { sendEmail } from "@/lib/email";
import WelcomeEmail from "@/emails/WelcomeEmail";
```

### 2. Send WelcomeEmail after DB upsert in `user.created`

Insert the following block **after** the `.onConflictDoUpdate(...)` call and **before** the `return NextResponse.json(...)` in the `user.created` branch:

```ts
// Send welcome email (fire-and-forget so it doesn't block the webhook response)
const email = email_addresses?.[0]?.email_address;
const displayName = [first_name, last_name].filter(Boolean).join(" ") || "there";

if (email) {
  sendEmail({
    to: email,
    subject:
      role === "TUTOR"
        ? "Welcome to NSKAI — Tutor Application Received"
        : "Welcome to NSKAI — Start Learning Today!",
    react: WelcomeEmail({ name: displayName, role: role === "ADMIN" ? "LEARNER" : role }),
  }).catch((err) =>
    console.error("[WEBHOOK] Failed to send welcome email:", err),
  );
}
```

## Design Decisions

| Decision | Rationale |
|---|---|
| **Fire-and-forget** (`.catch(...)` without `await`) | Webhook must return 200 promptly; email delivery is best-effort. |
| **`role === "ADMIN"` maps to `"LEARNER"`** | `WelcomeEmail` only supports `"TUTOR" \| "LEARNER"`; ADMIN users get the learner variant. |
| **`displayName` fallback to `"there"`** | Handles cases where Clerk provides no first/last name. |
| **Subject varies by role** | Tutors see "Application Received"; learners see "Start Learning Today!". |

## Files Modified

- `app/api/webhooks/clerk/route.ts` — two new imports + email-sending block in `user.created` handler.

## No Other Files Affected

- `emails/WelcomeEmail.tsx` — unchanged
- `lib/email.ts` — unchanged
