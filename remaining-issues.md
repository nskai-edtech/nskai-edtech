# Remaining Issues — Gap Analysis Audit

## CRITICAL (Pre-Production Blockers)

### 1. Paystack Payment Failure Handling

Only `charge.success` is handled in the webhook. If a payment fails, there's no `charge.failed` handler, so users could get charged with no feedback or stuck in a bad state.

### 2. AI Chat Rate Limiting

`/api/ai/chat` has zero rate limiting. Any authenticated user could spam the endpoint and rack up costs on the Python AI server (or cause a DDoS).

---

## HIGH PRIORITY (Should Fix Before Launch)

### 3. Skills & Diagnostic Assessment System

The only major feature with a complete schema (5 tables: `skills`, `skillDependencies`, `userSkills`, `assessments`, `userAssessmentResults`) but absolutely zero implementation. No actions, no API routes, no UI. If this is a selling point of the platform, it needs building. If not, the dead schema tables should be cleaned up.

### 4. Admin Analytics Charts

The admin dashboard (`/org`) only has stat cards and a pending-actions feed. Unlike the tutor analytics page (which has revenue/enrollment trend charts, course performance tables, quiz stats), the admin has no revenue-over-time or user-growth charts. For a platform taking payments, admin needs visibility into revenue trends.

### 5. Timestamped Notes

Notes work but aren't linked to video timestamps. Learners can't click a note to jump to that point in the video — a common expectation for educational platforms.

### 6. Persistent AI Chat History

AI conversations disappear on page refresh. There's no database table for chat messages, so learners lose context between sessions, and tutors can't review common questions.

---

## MEDIUM PRIORITY (Post-Launch Enhancements)

### 7. Missing Email Templates

- **new-course-available** — notify learners of courses matching their interests
- **course-completed** — congratulations on 100% completion

Neither template exists yet.

### 8. Advanced Search Gaps

No filter by duration or difficulty level (difficulty isn't even in the schema).

### 9. In-App Notifications System

No notifications table, no real-time updates. Users have no way to know about new enrollments, approvals, or reviews without checking email.

---

## Recommendations

| #   | Item                       | Effort Estimate | Notes                                           |
| --- | -------------------------- | --------------- | ----------------------------------------------- |
| 1   | Paystack failure handling  | ~Few hours      | Quick win                                       |
| 2   | AI chat rate limiting      | ~Few hours      | Quick win                                       |
| 3   | Skills & Assessment system | Large           | Decision needed: build it or remove dead tables |
| 4   | Admin analytics charts     | 1–2 days        |                                                 |
| 5   | Timestamped notes          | 1–2 days        |                                                 |
| 6   | Persistent AI chat history | 1–2 days        |                                                 |
| 7   | Missing email templates    | < 1 day         |                                                 |
| 8   | Advanced search gaps       | 1–2 days        | Requires schema change for difficulty           |
| 9   | In-app notifications       | 1–2 days        | Requires new table + real-time layer            |
