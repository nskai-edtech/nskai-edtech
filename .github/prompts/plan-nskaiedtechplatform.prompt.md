# NSKAI EdTech Platform - Comprehensive Project Summary

## Executive Overview

You're building **NSKAI**, a sophisticated AI-powered Learning Management System (LMS) with strict role separation, intelligent course delivery, and a focus on simplicity through a monolithic architecture.

An end-to-end educational technology platform serving three distinct user personas:

1. **Organization Admins** – School/business owners managing billing, staff approvals, and organizational settings
2. **Tutors** – Content creators building courses, managing lessons, grading assignments, and tracking progress
3. **Learners** – Students consuming video content, taking quizzes, submitting assignments, and earning certificates

---

## Core Tech Stack

| Layer                | Technology                   | Purpose                                              |
| -------------------- | ---------------------------- | ---------------------------------------------------- |
| **Framework**        | Next.js 16 (App Router)      | React Server Components + API Routes in one monolith |
| **Language**         | TypeScript 5                 | Type-safe development preventing runtime errors      |
| **Database**         | PostgreSQL (Neon Serverless) | Scalable, serverless SQL database                    |
| **ORM**              | Drizzle ORM 0.45             | Lightweight, type-safe database queries              |
| **Authentication**   | Clerk                        | Auth, permissions, webhooks, and 2FA                 |
| **Video**            | Mux                          | Video hosting, encoding, streaming, and player       |
| **File Uploads**     | UploadThing                  | File storage for course attachments and images       |
| **Payments**         | Paystack                     | Payment processing for course purchases              |
| **AI Engine**        | OpenAI API                   | AI tutoring, summaries, and quiz generation          |
| **Email**            | Resend                       | Transactional emails for confirmations/notifications |
| **UI Framework**     | Tailwind CSS + shadcn/ui     | Rapid UI development with pre-built components       |
| **State Management** | Zustand                      | Client-side state for modals, notifications          |
| **Charts**           | Recharts                     | Analytics and progress visualization                 |
| **Forms**            | React Hook Form + Zod        | Type-safe form handling with validation              |

---

## Database Schema Overview

### Core Tables (Who & What)

- **users** – Synced from Clerk; stores role (ADMIN/TUTOR/LEARNER), status, interests, gamification points, Paystack customer ID
- **courses** – Created by tutors; status tracks workflow (DRAFT → PENDING → PUBLISHED/REJECTED)
- **chapters** – Sections within a course (ordered by position)
- **lessons** – Individual video/quiz content within chapters; can be marked as free preview
- **muxData** – Links lessons to Mux video assets for playback

### Learning & Progress (Student Journey)

- **userProgress** – Tracks lesson completion, playback position, last access timestamp
- **purchases** – Records course purchases with Paystack reference and amount
- **userQuizAttempts** – Stores quiz answers and scores
- **assignments** – Course assignments with max score
- **assignmentSubmissions** – Student work submissions with grading status (PENDING/GRADED/REJECTED) and feedback

### Interactions & Engagement

- **reviews** – Course reviews with ratings and comments
- **courseLikes** – User wishlist/liking system
- **userNotes** – Rich-text notes students take during lessons
- **questions & answers** – Q&A forum per lesson

### Advanced Features

- **certificates** – Generated upon course completion with verification URL
- **courseRequests** – Learners can request course creation
- **skills & assessments** – Diagnostic skill tracking with prerequisite dependencies
- **learningPaths** – Curated sequences of courses
- **gamification** – Points, streaks, badges; leaderboard tracking

---

## User Roles & Capabilities

### 🎓 Learner (Student)

- Browse and enroll in courses
- Pay for courses via Paystack integration
- Watch video lessons (free preview + purchased content)
- Take quizzes and submit assignments
- Track personal progress and earn certificates
- Ask questions in lesson Q&A section
- Take notes, add reviews, wishlist courses
- View dashboard with learning stats and continued learning widget
- Earn gamification points and compete on leaderboard

### 👨‍🏫 Tutor (Teacher)

- Create and manage courses with chapters and lessons
- Upload videos via Mux uploader with progress tracking
- Create quizzes with multiple-choice questions
- Design assignments and grade submissions with feedback
- Track student progress and analytics (completion %, watch time, performance)
- Review and respond to student Q&A
- Monitor course performance and identify low-performing students
- Submit courses for approval; respond to rejection feedback
- View activity feed and recent submissions dashboard
- Manage tutor profile and settings

### ⚙️ Organization Admin (School/Company)

- Approve/reject tutors and courses before publishing
- Manage learners and understand enrollment/spending patterns
- View organization-wide analytics and overview stats
- Manage staff approvals and tutor onboarding
- Handle billing and revenue tracking
- Monitor site-wide learner activity

---

## Key Features Status

### ✅ Completed

- **Database Schema** (~95%) – All core tables designed
- **Authentication** – Clerk integration with role-based metadata
- **Onboarding Flows** – Learner (interests/goals) and Tutor (expertise/bio) workflows
- **Video Management** – Mux integration with upload/playback/webhook handling
- **Course Management** – Create, edit, publish workflow with approval
- **File Uploads** – UploadThing for documents and images
- **Progress Tracking** – Lesson completion, watch time, quiz scores
- **Certificates** – Generation and verification download with PDF export

### ⚠️ In Progress (65-80% Complete)

- **Admin Panel** – Course approvals, learner management, analytics
- **Tutor Dashboard** – Analytics, submissions, low-performing courses
- **Learner Experience** – Marketplace, enrolled courses, watch experience
- **Payment Processing** – Paystack integration (backend done, webhooks pending)
- **Email System** – Templates built, additional workflows needed

### ❌ Not Started (0% Complete)

- **AI Tutor Integration** – OpenAI API for Q&A, summaries, quiz generation
- **Payment Webhooks** – Paystack success/failure handling
- **Skills Assessment** – Diagnostic tests and mastery tracking
- **Full Email Coverage** – More transactional email workflows
- **Advanced Analytics** – Detailed learner journey and tutor insights

---

## Architecture & Data Flow

### The "Gatekeeper" (Middleware)

Every request hits middleware first:

1. Check if user is logged in (via Clerk session)
2. Verify user role from Clerk metadata
3. Enforce route access control (e.g., `/org` requires ADMIN role)

### The "Engine" (Server Actions)

- No traditional REST API separation
- Next.js Server Actions handle business logic
  - Example: `createCourse()` called directly from frontend component
  - Securely executes on server, validates permissions, talks to database
  - Returns result to browser automatically

### Data Flow Examples

```
Learner: Browse Marketplace
  → Enroll Course
  → Make Payment
  → Access Lessons
  → Complete Quiz
  → Earn Certificate

Tutor: Create Course
  → Upload Videos
  → Create Quizzes
  → Submit for Approval
  → Review Student Progress

Admin: Review Pending Courses
  → Approve/Reject
  → Monitor Learner Engagement
```

---

## Project Structure

```
app/                    # Pages users see
├── (auth)             # Public auth (signin/signup)
├── (marketing)        # Public landing pages
└── (protected)        # Login required
    ├── learner/       # Student pages (marketplace, enrolled, certificates, etc.)
    ├── tutor/         # Teacher dashboard (analytics, courses, submissions)
    ├── org/           # Admin pages (approvals, learners, tutors)
    ├── watch/         # Video player + Q&A
    └── api/           # Webhooks (Clerk, Mux, Paystack)

components/           # Reusable UI
├── ui/               # Basic components (buttons, inputs)
├── dashboard/        # Smart dashboard components
├── courses/          # Course-related components
├── analytics/        # Charts and analytics
└── providers/        # Context providers

actions/              # Server-side business logic
├── courses/          # Course CRUD and queries
├── progress/         # Progress tracking
├── assessments/      # Quiz and assignment handling
├── certificates/     # Certificate generation
├── payments/         # Payment processing
├── admin/            # Admin queries and actions
└── analytics/        # Dashboard data aggregation

lib/                  # Utilities
├── db.ts            # Database connection
├── format.ts        # Date/money formatting
└── uploadthing.ts   # File upload config

drizzle/             # Database
├── schema/          # Table definitions
└── migrations/      # Database version history
```

---

## Development Status Summary

| Area                        | Completion | Status                                              |
| --------------------------- | ---------- | --------------------------------------------------- |
| Database Schema             | 95%        | Only missing minor enums/fields                     |
| Authentication & Onboarding | 80%        | Clerk configured, flow complete                     |
| Video Management (Mux)      | 100%       | Upload, playback, webhooks done                     |
| Course Management           | 65%        | CRUD done, approval workflow working                |
| Progress Tracking           | 80%        | Lesson completion, but advanced analytics pending   |
| Admin Panel                 | 60%        | Basic approvals working, needs full analytics       |
| Learner Experience          | 30%        | Marketplace functional, watch experience needs work |
| Tutor Analytics             | 70%        | Dashboard skeleton with some data                   |
| Payment Integration         | 40%        | Backend logic done, webhooks not implemented        |
| Email System                | 20%        | Templates exist, coverage lacks                     |
| **AI Features**             | **0%**     | **Not started – major differentiator**              |
| **Skills & Assessment**     | **0%**     | **Schema exists, no implementation**                |

---

## Key Design Decisions

1. **Monolithic over Microservices** – Keep it simple; all in Next.js
2. **Role-Based Access Control** – Enforced at both UI and server level
3. **Server Actions, not REST** – Simpler data flow, fewer moving parts
4. **Drizzle over Prisma** – Faster, lower overhead, better for large schemas
5. **Clerk for Auth** – Outsource complexity; handle roles via metadata
6. **Feature-Organized Code** – Group by domain (courses, payments) not file type

---

## Next Steps for Development

The platform is **foundation-solid** but needs prioritized work on:

1. **AI Tutor** (high impact, big differentiator)
2. **Payment Webhooks** (for revenue)
3. **Email Coverage** (user engagement)
4. **Advanced Analytics** (business intelligence)
5. **Skills System** (educational value)
