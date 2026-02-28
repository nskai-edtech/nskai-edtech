import { Metadata } from "next";
import {
  Building2,
  Users,
  BarChart3,
  ShieldCheck,
  CheckCircle,
  BookOpen,
  Brain,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "For Schools & Institutions | ZERRA by NSKAI",
  description:
    "Transform your institution with ZERRA's AI-powered LMS. Multi-tutor management, course approval workflows, organization-wide analytics, and more.",
};

const FEATURES = [
  {
    icon: Building2,
    title: "Multi-Tenant Organization",
    description:
      "Set up your institution as an organization on ZERRA. Manage all tutors and learners under one roof with centralized administration.",
  },
  {
    icon: ClipboardList,
    title: "Course Approval Workflow",
    description:
      "Maintain quality standards with a built-in approval process. Admins review and approve courses before they go live to learners.",
  },
  {
    icon: Users,
    title: "Tutor & Learner Management",
    description:
      "Invite tutors to create content, manage learner enrollments, and control access — all from a single admin dashboard.",
  },
  {
    icon: BarChart3,
    title: "Organization-Wide Analytics",
    description:
      "Track enrollment rates, course completion, learner engagement, and revenue across your entire institution in real time.",
  },
  {
    icon: Brain,
    title: "AI-Powered Tutoring",
    description:
      "Give your students 24/7 access to context-aware AI tutors that answer questions based on the actual lesson content your tutors create.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access Control",
    description:
      "Strict separation between admin, tutor, and learner roles. Each user sees only what they need — enforced at the server level.",
  },
];

const BENEFITS = [
  "Reduce administrative overhead with centralized course management",
  "Improve student outcomes with AI-assisted learning support",
  "Scale your curriculum without scaling your staff proportionally",
  "Track institutional KPIs with built-in analytics dashboards",
  "Ensure content quality with course approval before publication",
  "Provide learners with verifiable certificates upon completion",
  "Secure video streaming with content protection built in",
  "Gamification features that keep students engaged and motivated",
];

export default function ForSchoolsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-block bg-brand/10 text-brand text-sm font-semibold px-4 py-2 rounded-full mb-6">
          For Schools
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary-text mb-6">
          A Modern LMS for{" "}
          <span className="text-brand">Your Institution</span>
        </h1>
        <p className="text-lg text-secondary-text max-w-3xl mx-auto">
          ZERRA gives schools, universities, and training organizations a
          complete AI-powered learning platform with admin controls, tutor
          management, and data-driven insights — all under one roof.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="bg-surface border border-border rounded-2xl p-6"
          >
            <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-4">
              <feature.icon className="w-6 h-6 text-brand" />
            </div>
            <h3 className="text-lg font-bold text-primary-text mb-2">
              {feature.title}
            </h3>
            <p className="text-secondary-text text-sm leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Benefits */}
      <div className="bg-surface border border-border rounded-2xl p-8 mb-20">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-6 h-6 text-brand" />
          <h2 className="text-2xl font-bold text-primary-text">
            Why Institutions Choose ZERRA
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {BENEFITS.map((benefit) => (
            <div key={benefit} className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-brand shrink-0 mt-0.5" />
              <span className="text-secondary-text text-sm">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-primary-text text-center mb-12">
          Getting Started Is Simple
        </h2>
        <div className="grid sm:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-brand/20 mb-3">01</div>
            <h3 className="font-bold text-primary-text mb-2">
              Set Up Your Organization
            </h3>
            <p className="text-secondary-text text-sm">
              Create your institution account, configure branding, and set up
              your admin dashboard.
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-brand/20 mb-3">02</div>
            <h3 className="font-bold text-primary-text mb-2">
              Invite Your Team
            </h3>
            <p className="text-secondary-text text-sm">
              Add tutors to create courses and invite learners to start their
              educational journey.
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-brand/20 mb-3">03</div>
            <h3 className="font-bold text-primary-text mb-2">
              Launch &amp; Monitor
            </h3>
            <p className="text-secondary-text text-sm">
              Approve courses, monitor engagement through analytics, and watch
              your institution thrive.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center bg-brand/5 border border-brand/20 rounded-2xl p-12">
        <h2 className="text-2xl font-bold text-primary-text mb-4">
          Ready to Transform Your Institution?
        </h2>
        <p className="text-secondary-text mb-6 max-w-xl mx-auto">
          Schedule a demo with our education team to see how ZERRA can serve
          your school, university, or training organization.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/contact"
            className="bg-brand text-white px-6 py-3 rounded-full font-medium hover:bg-brand/90 transition-colors"
          >
            Schedule a Demo
          </Link>
          <Link
            href="/case-studies"
            className="border border-border px-6 py-3 rounded-full font-medium text-primary-text hover:bg-surface-muted transition-colors"
          >
            View Case Studies
          </Link>
        </div>
      </div>
    </div>
  );
}
