# Build + Wire Course Rejected Email into rejectCourse (+ Rejection Reason)

## Context

- **rejectCourse** (`actions/courses/admin.ts`) currently calls `updateCourseStatus(courseId, "REJECTED")` with no email and no reason parameter.
- **review-actions.tsx** (`app/(protected)/org/approvals/[courseId]/_components/review-actions.tsx`) already collects a rejection reason via `prompt()` on line 47 but does **not** pass it to `rejectCourse`.
- **sendEmail** (`lib/email.ts`) wraps Resend — same utility used by the welcome and course-approved emails.
- No course-rejected email template exists yet.

## Changes

### 1. Create `emails/CourseRejectedEmail.tsx`

New template accepting `{ tutorName: string; courseTitle: string; reason?: string }`.

- Matches the existing design system (black header with NSK/AI logo, same footer).
- **Red highlight box** (`#fef2f2` bg, `#fecaca` border, `#991b1b` / `#b91c1c` text) for the rejection reason — only renders when `reason` is provided.
- **Blue tip box** (`#eff6ff` bg, `#bfdbfe` border, `#1e40af` / `#1d4ed8` text) with "How to improve your course" steps.
- **Black CTA button** → `https://nskai.org/tutor/courses` ("Edit Your Course").

### 2. Update `rejectCourse` in `actions/courses/admin.ts`

Add import:

```ts
import CourseRejectedEmail from "@/emails/CourseRejectedEmail";
```

Replace the function:

```ts
export async function rejectCourse(courseId: string, reason?: string) {
  const result = await updateCourseStatus(courseId, "REJECTED");

  if (result.success) {
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      with: { tutor: true },
    });

    const tutorEmail = course?.tutor?.email;
    const tutorName =
      [course?.tutor?.firstName, course?.tutor?.lastName]
        .filter(Boolean)
        .join(" ") || "Tutor";

    if (tutorEmail) {
      sendEmail({
        to: tutorEmail,
        subject: `Your course "${course.title}" was not approved`,
        react: CourseRejectedEmail({
          tutorName,
          courseTitle: course.title,
          reason: reason || undefined,
        }),
      }).catch((err) =>
        console.error("[REJECT_COURSE] Failed to send email:", err),
      );
    }
  }

  return result;
}
```

### 3. Update `review-actions.tsx` to pass `reason`

```diff
-      const result = await rejectCourse(courseId);
+      const result = await rejectCourse(courseId, reason || undefined);
```

## Design Decisions

| Decision                                            | Rationale                                                             |
| --------------------------------------------------- | --------------------------------------------------------------------- |
| **Fire-and-forget** (`.catch(...)` without `await`) | Server action stays fast; email delivery is best-effort.              |
| **Red box for reason, blue box for tips**           | Visually separates the "what went wrong" from the "what to do next".  |
| **`reason` is optional**                            | Admin can skip the reason; email still sends without the red box.     |
| **Black CTA button** (not red)                      | Encourages the tutor to take action rather than conveying negativity. |
| **Reason collected via existing `prompt()`**        | The UI already asks for it — we just forward the value now.           |

## Files Modified

- `emails/CourseRejectedEmail.tsx` — **new file**
- `actions/courses/admin.ts` — new import + updated `rejectCourse` signature and body
- `app/(protected)/org/approvals/[courseId]/_components/review-actions.tsx` — pass `reason` to `rejectCourse`

## No Other Files Affected

- `lib/email.ts` — unchanged
- `emails/CourseApprovedEmail.tsx` — unchanged
- `updateCourseStatus` — unchanged
