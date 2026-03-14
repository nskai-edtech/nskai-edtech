import { Metadata } from "next";
import Link from "next/link";
import {
  Code2,
  BookOpen,
  Users,
  BarChart3,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "API Reference | ZERRA by NSKAI",
  description:
    "Explore the ZERRA API for integrating courses, learner data, analytics, and more into your applications.",
};

const API_SECTIONS = [
  {
    icon: BookOpen,
    title: "Courses",
    description:
      "Retrieve course catalogs, chapters, and lesson data. Filter by category, tag, tutor, or price.",
    endpoints: [
      {
        method: "GET",
        path: "/api/courses",
        desc: "List all published courses",
      },
      { method: "GET", path: "/api/courses/:id", desc: "Get course details" },
      {
        method: "GET",
        path: "/api/courses/:id/chapters",
        desc: "List chapters for a course",
      },
      {
        method: "GET",
        path: "/api/courses/:id/lessons",
        desc: "List lessons for a course",
      },
    ],
  },
  {
    icon: Users,
    title: "Users & Enrollment",
    description:
      "Manage user profiles, enrollments, and role assignments across Organization, Tutor, and Learner accounts.",
    endpoints: [
      {
        method: "GET",
        path: "/api/users/me",
        desc: "Get current user profile",
      },
      {
        method: "GET",
        path: "/api/enrollments",
        desc: "List enrollments for a learner",
      },
      {
        method: "POST",
        path: "/api/enrollments",
        desc: "Enroll a learner in a course",
      },
      {
        method: "GET",
        path: "/api/enrollments/:id/progress",
        desc: "Get enrollment progress",
      },
    ],
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Access platform analytics including course engagement, learner progress, and revenue reporting for organizations.",
    endpoints: [
      {
        method: "GET",
        path: "/api/analytics/overview",
        desc: "Platform analytics summary",
      },
      {
        method: "GET",
        path: "/api/analytics/courses/:id",
        desc: "Per-course analytics",
      },
      {
        method: "GET",
        path: "/api/analytics/learners",
        desc: "Learner activity analytics",
      },
      {
        method: "GET",
        path: "/api/analytics/revenue",
        desc: "Revenue and earnings data",
      },
    ],
  },
  {
    icon: GraduationCap,
    title: "AI Tutor",
    description:
      "Interact with the context-aware AI Tutor. Submit questions with lesson context and receive intelligent responses.",
    endpoints: [
      {
        method: "POST",
        path: "/api/ai-tutor/ask",
        desc: "Ask the AI tutor a question",
      },
      {
        method: "GET",
        path: "/api/ai-tutor/history",
        desc: "Retrieve conversation history",
      },
      {
        method: "GET",
        path: "/api/ai-tutor/settings",
        desc: "Get AI tutor configuration",
      },
    ],
  },
  {
    icon: ShieldCheck,
    title: "Certificates & Gamification",
    description:
      "Generate certificates for completed courses and retrieve XP, point totals, and achievement badges.",
    endpoints: [
      {
        method: "GET",
        path: "/api/certificates",
        desc: "List earned certificates",
      },
      {
        method: "GET",
        path: "/api/certificates/:id",
        desc: "Get certificate details",
      },
      { method: "GET", path: "/api/gamification/xp", desc: "Get XP totals" },
      {
        method: "GET",
        path: "/api/gamification/leaderboard",
        desc: "Leaderboard rankings",
      },
    ],
  },
  {
    icon: Code2,
    title: "Webhooks & Events",
    description:
      "Subscribe to real-time events such as course completions, enrollments, and payment confirmations.",
    endpoints: [
      {
        method: "POST",
        path: "/api/webhooks",
        desc: "Register a webhook endpoint",
      },
      { method: "GET", path: "/api/webhooks", desc: "List active webhooks" },
      {
        method: "DELETE",
        path: "/api/webhooks/:id",
        desc: "Remove a webhook",
      },
    ],
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  POST: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  DELETE: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export default function APIReferencePage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-block bg-brand/10 text-brand text-sm font-semibold px-4 py-2 rounded-full mb-6">
          API Reference
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary-text mb-6">
          Build with <span className="text-brand">ZERRA</span>
        </h1>
        <p className="text-lg text-secondary-text max-w-2xl mx-auto">
          Integrate ZERRA&apos;s courses, analytics, AI tutoring, and
          gamification into your own applications using our RESTful API.
        </p>
      </div>

      {/* Quick Start */}
      <div className="bg-surface border border-border rounded-2xl p-8 mb-16">
        <h2 className="text-xl font-bold text-primary-text mb-4">
          Quick Start
        </h2>
        <p className="text-secondary-text mb-6">
          All API requests require an API key passed in the{" "}
          <code className="bg-surface-muted px-2 py-1 rounded text-sm">
            Authorization
          </code>{" "}
          header as a Bearer token. Base URL:{" "}
          <code className="bg-surface-muted px-2 py-1 rounded text-sm">
            https://nskai.org/api/v1
          </code>
        </p>
        <div className="bg-gray-900 text-gray-100 rounded-xl p-5 font-mono text-sm overflow-x-auto">
          <div className="text-gray-400">
            # Example: List all published courses
          </div>
          <div className="mt-1">
            curl -X GET https://nskai.org/api/v1/courses \
          </div>
          <div className="pl-4">
            -H &quot;Authorization: Bearer YOUR_API_KEY&quot; \
          </div>
          <div className="pl-4">
            -H &quot;Content-Type: application/json&quot;
          </div>
        </div>
      </div>

      {/* Authentication */}
      <div className="bg-surface border border-border rounded-2xl p-8 mb-16">
        <h2 className="text-xl font-bold text-primary-text mb-4">
          Authentication
        </h2>
        <div className="text-secondary-text space-y-3 text-sm leading-relaxed">
          <p>
            ZERRA uses <strong>Bearer token authentication</strong> powered by
            Clerk. API keys can be generated from your dashboard settings under
            the &ldquo;API&rdquo; tab (available to Tutor and Organization
            accounts).
          </p>
          <p>
            All requests must include the header:{" "}
            <code className="bg-surface-muted px-2 py-1 rounded">
              Authorization: Bearer &lt;api_key&gt;
            </code>
          </p>
          <p>
            Rate limits: <strong>100 requests/minute</strong> for standard keys.
            Organization accounts may request elevated limits by contacting us.
          </p>
        </div>
      </div>

      {/* API Sections */}
      <div className="space-y-12 mb-16">
        {API_SECTIONS.map((section) => (
          <div
            key={section.title}
            className="bg-surface border border-border rounded-2xl p-8"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-brand/10 p-3 rounded-xl">
                <section.icon className="w-6 h-6 text-brand" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-primary-text">
                  {section.title}
                </h2>
                <p className="text-sm text-secondary-text mt-1">
                  {section.description}
                </p>
              </div>
            </div>
            <div className="divide-y divide-border">
              {section.endpoints.map((ep) => (
                <div
                  key={ep.path + ep.method}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-md w-fit ${METHOD_COLORS[ep.method]}`}
                  >
                    {ep.method}
                  </span>
                  <code className="text-sm font-mono text-primary-text">
                    {ep.path}
                  </code>
                  <span className="text-xs text-secondary-text sm:ml-auto">
                    {ep.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Response Format */}
      <div className="bg-surface border border-border rounded-2xl p-8 mb-16">
        <h2 className="text-xl font-bold text-primary-text mb-4">
          Response Format
        </h2>
        <p className="text-secondary-text text-sm mb-4">
          All responses return JSON. Successful requests return a{" "}
          <code className="bg-surface-muted px-2 py-1 rounded">data</code>{" "}
          field. Errors return{" "}
          <code className="bg-surface-muted px-2 py-1 rounded">error</code> with
          a <code className="bg-surface-muted px-2 py-1 rounded">message</code>{" "}
          and <code className="bg-surface-muted px-2 py-1 rounded">code</code>.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2">
              Success (200)
            </div>
            <div className="bg-gray-900 text-gray-100 rounded-xl p-4 font-mono text-xs">
              {`{
  "data": {
    "id": "course_abc123",
    "title": "Intro to Python",
    "tutor": "Jane Doe"
  }
}`}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-red-600 dark:text-red-400 mb-2">
              Error (401)
            </div>
            <div className="bg-gray-900 text-gray-100 rounded-xl p-4 font-mono text-xs">
              {`{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid API key"
  }
}`}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center bg-surface border border-border rounded-2xl p-12">
        <h2 className="text-2xl font-bold text-primary-text mb-3">
          Need Help with the API?
        </h2>
        <p className="text-secondary-text mb-6">
          Our documentation is expanding. For questions, feature requests, or
          integration support, get in touch.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/documentation"
            className="bg-brand text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition"
          >
            View Documentation
          </Link>
          <a
            href="mailto:contact@nskai.org"
            className="border border-border px-6 py-3 rounded-xl font-semibold text-primary-text hover:bg-surface-muted transition"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
