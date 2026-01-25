# Project Technical Reference: AI-Powered EdTech Platform

## 1. Executive Summary

We are building a multi-tenant Learning Management System (LMS) that integrates Artificial Intelligence to enhance the teaching and learning experience.

The platform distinguishes itself by strictly separating three key roles:

- **Organization (Admin):** The school/business owner who manages staff and billing.
- **Tutor (Teacher):** The content creator who builds courses and grades students.
- **Learner (Student):** The end-user who consumes video content and takes quizzes.

**Core Philosophy:** Simplicity over complexity. We use a monolithic architecture (Next.js) with logical separation of concerns.

## 2. The Tech Stack (Our Toolkit)

We have chosen "boring," reliable, and industry-standard tools to ensure stability and speed.

| Category      | Technology               | Reasoning                                                                    |
| :------------ | :----------------------- | :--------------------------------------------------------------------------- |
| **Framework** | Next.js 14+ (App Router) | Handles both Backend (API Routes) and Frontend (React Server Components).    |
| **Language**  | TypeScript               | Enforces type safety, preventing 90% of "undefined" bugs before they happen. |
| **Database**  | PostgreSQL (via Neon)    | Serverless SQL database that scales automatically. Best in class.            |
| **ORM**       | Drizzle ORM              | Lightweight, type-safe database interaction. Faster and simpler than Prisma. |
| **Auth**      | Clerk                    | Handles complex flows (2FA, Sessions, Google Login) so we don't have to.     |
| **Video**     | Mux                      | Handles video encoding, storage, and streaming (like YouTube for devs).      |
| **Uploads**   | UploadThing              | easy file uploads for course attachments and images.                         |
| **Styling**   | Tailwind CSS             | Rapid UI development without leaving the HTML file.                          |
| **AI Engine** | OpenAI API               | Provides the intelligence for the "AI Tutor" and summaries.                  |

## 3. Architecture & Data Flow

Think of the application as a secure building with three different doors.

### The "Gatekeeper" (Middleware)

Every single request a user makes hits our Middleware first.

1. **Check 1:** Is the user logged in? (If no -> Redirect to Sign In).
2. **Check 2:** What is their role? (Stored in Clerk Metadata).
3. **Check 3:** Are they allowed in this room? (e.g., A "Learner" cannot enter the "/org" dashboard).

### The "Engine" (Server Actions)

We do not use a separate backend server. We use Next.js Server Actions.
Instead of `fetch('/api/create-course')`, we call a function `createCourse()` directly in our UI component.
Next.js securely executes this function on the server, talks to the Database (Neon), and returns the result to the browser.

## 4. Directory Structure (The Map)

Your codebase is organized by Feature, not just by file type.

```plaintext
/src
 ├── /app                   # The actual pages users see
 │   ├── (auth)             # Public auth pages (Sign In/Up)
 │   │   └── layout.tsx     # Clean layout without sidebars
 │   │
 │   ├── (dashboard)        # Protected Area (Requires Login)
 │   │   ├── layout.tsx     # The Main Dashboard Shell (Sidebar + Navbar)
 │   │   ├── /org           # Admin-only pages
 │   │   ├── /tutor         # Teacher-only pages
 │   │   └── /learner       # Student-only pages
 │   │
 │   └── api                # Webhooks (Clerk/Stripe) & AI Endpoints
 │
 ├── /components            # Reusable UI Blocks
 │   ├── /ui                # Dumb components (Buttons, Inputs) - shadcn/ui
 │   ├── /providers         # Context providers (Toast, Auth, Theme)
 │   └── /dashboard         # Smart components (Sidebar, Charts)
 │
 ├── /lib                   # Helper Functions
 │   ├── db.ts              # Database connection singleton
 │   ├── format.ts          # Money/Date formatting utilities
 │   └── teacher.ts         # Permission check logic
 │
 ├── /drizzle               # Database Blueprints
 │   ├── schema.ts          # The Database Tables definition
 │   └── /migrations        # History of database changes
 │
 ├── /actions               # The Backend Logic (Server Actions)
 │   ├── get-courses.ts
 │   └── get-progress.ts
```

## 5. The Database Schema (The Blueprint)

This is how our data relates to each other.

### Core Entities

- **Organization:** The "container" for everything. Holds the Stripe Customer ID.
- **User:** Synced from Clerk. Has a specific role (ORG_ADMIN, TUTOR, LEARNER).

### Learning Entities

- **Course:** Belongs to an Organization. Created by a Tutor.
  - Has Many **Chapters** (Sections of a course).
  - Has Many **Lessons** (The actual video/text).
    - Has One **MuxData** (Link to the video file).

### Progress Entities

- **UserProgress:** Tracks which lessons a specific student has finished.
- **Purchase:** Tracks which courses a student has bought (if not using a subscription model).

## 6. Key Features Description

### A. The "AI Tutor" Integration

This is not just a chatbot. It is context-aware.

- **How it works:** When a student asks a question inside "Lesson 3: React Hooks", we send the transcript of Lesson 3 to OpenAI along with the student's question.
- **Result:** The AI answers strictly based on the lesson material, acting as a true teaching assistant.

### B. The Video Player (The Classroom)

The heart of the app.

- **Functionality:** It tracks visibility. If a student watches 90% of the video, we automatically mark the lesson as "Completed" in the database via an API call.
- **Security:** Videos are strictly protected. Users cannot download them easily; they are streamed securely via Mux.

### C. Role-Based Access Control (RBAC)

We enforce strict boundaries.

- **Isolation:** A "Tutor" cannot see the "Billing" tab. A "Learner" cannot see the "Course Editor."
- **Implementation:** This is handled in two places:
  1. **UI Level:** We hide the buttons in the Sidebar.
  2. **Server Level:** Even if they guess the URL, the Server Action checks their ID and throws a 403 Forbidden error.

## 7. Configuration Variables (.env)

These are the keys you need to run the engine. **Never commit this file to GitHub.**

```bash
# Public (Safe to share in browser)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Secret (Server Only)
CLERK_SECRET_KEY=sk_test_...
DATABASE_URL=postgresql://neondb_...  # Your Neon DB String
OPENAI_API_KEY=sk-...                 # For the AI
MUX_TOKEN_ID=...                      # For Video
MUX_TOKEN_SECRET=...                  # For Video
STRIPE_API_KEY=sk_...                 # For Money
STRIPE_WEBHOOK_SECRET=whsec_...       # For Payment confirmation
```

## 8. Development Workflow (Standard Operating Procedure)

To ensure quality, we follow this loop:

1. **Ticket:** You pick a task (e.g., "Build Login Screen").
2. **Branch:** You create `feature/login-screen`.
3. **Code:** You write the code.
4. **Schema Change?** If you changed the database, you run `npx drizzle-kit generate` to create a migration file.
5. **Push:** You push to GitHub.
6. **PR:** You open a Pull Request.
7. **Review:** Another dev (or you, wearing your "Lead Hat") approves it.
8. **Merge:** It goes into `main`.
