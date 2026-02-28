import { Metadata } from "next";
import {
  BookOpen,
  GraduationCap,
  Code,
  Settings,
  Video,
  Brain,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Documentation | ZERRA by NSKAI",
  description:
    "Comprehensive guides for learners, tutors, and administrators to get the most out of the ZERRA platform.",
};

const GUIDES = [
  {
    icon: GraduationCap,
    title: "Getting Started",
    description:
      "New to ZERRA? Start here. Learn how to create your account, set your role, and navigate the platform.",
    links: [
      { label: "Creating Your Account", href: "#" },
      { label: "Choosing Your Role", href: "#" },
      { label: "Completing Onboarding", href: "#" },
      { label: "Navigating the Dashboard", href: "#" },
    ],
  },
  {
    icon: BookOpen,
    title: "For Learners",
    description:
      "Everything you need to know about browsing courses, enrolling, tracking progress, and using the AI tutor.",
    links: [
      { label: "Browsing the Course Marketplace", href: "#" },
      { label: "Enrolling in a Course", href: "#" },
      { label: "Using the AI Tutor", href: "#" },
      { label: "Tracking Your Progress & XP", href: "#" },
      { label: "Earning Certificates", href: "#" },
    ],
  },
  {
    icon: Video,
    title: "For Tutors",
    description:
      "Learn how to create courses, upload videos, build quizzes, and analyze learner engagement.",
    links: [
      { label: "Creating a New Course", href: "#" },
      { label: "Adding Chapters & Lessons", href: "#" },
      { label: "Uploading Videos", href: "#" },
      { label: "Building Quizzes", href: "#" },
      { label: "Viewing Analytics & Reviews", href: "#" },
    ],
  },
  {
    icon: Settings,
    title: "For Administrators",
    description:
      "Manage your organization, approve courses, view analytics, and configure settings.",
    links: [
      { label: "Organization Setup", href: "#" },
      { label: "Managing Tutors & Learners", href: "#" },
      { label: "Course Approval Workflow", href: "#" },
      { label: "Organization Analytics", href: "#" },
      { label: "Billing & Subscriptions", href: "#" },
    ],
  },
  {
    icon: Brain,
    title: "AI Tutor Guide",
    description:
      "Understand how ZERRA's context-aware AI tutors work and how to get the best results from them.",
    links: [
      { label: "How AI Tutors Work", href: "#" },
      { label: "Asking Effective Questions", href: "#" },
      { label: "AI Tutor Settings (For Tutors)", href: "#" },
      { label: "Privacy & Data Handling", href: "#" },
    ],
  },
  {
    icon: Code,
    title: "API & Integrations",
    description:
      "Technical documentation for developers looking to integrate with or extend the ZERRA platform.",
    links: [
      { label: "API Reference", href: "/api-reference" },
      { label: "Authentication", href: "#" },
      { label: "Webhooks", href: "#" },
      { label: "Rate Limits", href: "#" },
    ],
  },
];

export default function DocumentationPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-block bg-brand/10 text-brand text-sm font-semibold px-4 py-2 rounded-full mb-6">
          Documentation
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary-text mb-6">
          ZERRA <span className="text-brand">Docs</span>
        </h1>
        <p className="text-lg text-secondary-text max-w-2xl mx-auto">
          Everything you need to know about using ZERRA — whether you&apos;re a
          learner, tutor, administrator, or developer.
        </p>
      </div>

      {/* Guides Grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-20">
        {GUIDES.map((guide) => (
          <div
            key={guide.title}
            className="bg-surface border border-border rounded-2xl p-6"
          >
            <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-4">
              <guide.icon className="w-6 h-6 text-brand" />
            </div>
            <h3 className="text-lg font-bold text-primary-text mb-2">
              {guide.title}
            </h3>
            <p className="text-secondary-text text-sm leading-relaxed mb-4">
              {guide.description}
            </p>
            <ul className="space-y-2">
              {guide.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-brand text-sm hover:underline"
                  >
                    {link.label} &rarr;
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Help CTA */}
      <div className="text-center bg-surface border border-border rounded-2xl p-12">
        <h2 className="text-2xl font-bold text-primary-text mb-4">
          Can&apos;t Find What You Need?
        </h2>
        <p className="text-secondary-text mb-6 max-w-xl mx-auto">
          Our help center and support team are ready to assist. Reach out
          anytime.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/help"
            className="bg-brand text-white px-6 py-3 rounded-full font-medium hover:bg-brand/90 transition-colors"
          >
            Visit Help Center
          </Link>
          <Link
            href="/contact"
            className="border border-border px-6 py-3 rounded-full font-medium text-primary-text hover:bg-surface-muted transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
