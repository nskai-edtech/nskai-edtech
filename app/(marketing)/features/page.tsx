import { Metadata } from "next";
import {
  Brain,
  Video,
  BookOpen,
  BarChart3,
  Award,
  Shield,
  Gamepad2,
  FileText,
  MessageSquare,
  Star,
  Route,
  Heart,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Platform Features | ZERRA by NSKAI",
  description:
    "Explore ZERRA's powerful suite of features — AI tutoring, video courses, gamification, certificates, progress tracking, and more.",
};

const CORE_FEATURES = [
  {
    icon: Brain,
    title: "Context-Aware AI Tutors",
    description:
      "ZERRA's AI tutors don't give generic answers. They read the transcript of the lesson you're watching and respond based on the actual course material — like a teaching assistant who knows the syllabus.",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-100 dark:bg-violet-900/30",
  },
  {
    icon: Video,
    title: "Secure Video Streaming",
    description:
      "All course videos are encoded and streamed through Mux, delivering adaptive-bitrate playback across all devices. Videos are protected from unauthorized downloading.",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    icon: BookOpen,
    title: "Structured Course Builder",
    description:
      "Tutors organize content into courses, chapters, and lessons. Add video, attach supplementary files, set lessons as free previews, and control the publication workflow.",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description:
      "Dashboards for tutors and admins show enrollment counts, completion rates, revenue, and learner engagement metrics — all updated in real time.",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-100 dark:bg-orange-900/30",
  },
  {
    icon: Award,
    title: "Verifiable Certificates",
    description:
      "Learners earn certificates upon completing courses. Each certificate is uniquely identifiable and can be shared or verified by employers and institutions.",
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
  },
  {
    icon: Gamepad2,
    title: "XP & Gamification",
    description:
      "Earn experience points for completing lessons, quizzes, and courses. Gamification elements keep learners motivated and engaged throughout their journey.",
    color: "text-pink-600 dark:text-pink-400",
    bg: "bg-pink-100 dark:bg-pink-900/30",
  },
];

const ADDITIONAL_FEATURES = [
  {
    icon: Shield,
    title: "Role-Based Access Control",
    description:
      "Strict separation between Learners, Tutors, and Organization Admins. Each role sees only what they need — enforced at both the UI and server levels.",
  },
  {
    icon: FileText,
    title: "Quizzes & Assessments",
    description:
      "Build quizzes attached to lessons or chapters. Multiple-choice, scoring, and automatic grading help tutors measure comprehension.",
  },
  {
    icon: MessageSquare,
    title: "Notes & Q&A",
    description:
      "Learners can take timestamped notes during video lessons and post questions that tutors or the AI can answer in context.",
  },
  {
    icon: Star,
    title: "Ratings & Reviews",
    description:
      "Learners rate courses after completion, helping future students discover the best content and giving tutors actionable feedback.",
  },
  {
    icon: Route,
    title: "Learning Paths",
    description:
      "Curated sequences of courses guide learners through a structured curriculum — from beginner fundamentals to advanced specializations.",
  },
  {
    icon: Heart,
    title: "Wishlist & Recommendations",
    description:
      "Save courses for later with the wishlist feature, and receive personalized course recommendations based on your learning history.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-block bg-brand/10 text-brand text-sm font-semibold px-4 py-2 rounded-full mb-6">
          Platform Features
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary-text mb-6">
          Everything You Need to{" "}
          <span className="text-brand">Teach &amp; Learn</span>
        </h1>
        <p className="text-lg text-secondary-text max-w-3xl mx-auto">
          ZERRA combines AI intelligence, professional video delivery, and
          powerful course management into one platform built for modern
          education.
        </p>
      </div>

      {/* Core Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {CORE_FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="bg-surface border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
          >
            <div
              className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}
            >
              <feature.icon className={`w-6 h-6 ${feature.color}`} />
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

      {/* Additional Features */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-primary-text text-center mb-4">
          And That&apos;s Not All
        </h2>
        <p className="text-secondary-text text-center max-w-2xl mx-auto mb-12">
          ZERRA is packed with features designed to create a complete,
          end-to-end learning ecosystem.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ADDITIONAL_FEATURES.map((feature) => (
            <div key={feature.title} className="flex gap-4 p-4">
              <div className="w-10 h-10 bg-brand/10 rounded-lg flex items-center justify-center shrink-0">
                <feature.icon className="w-5 h-5 text-brand" />
              </div>
              <div>
                <h3 className="font-bold text-primary-text mb-1">
                  {feature.title}
                </h3>
                <p className="text-secondary-text text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* For Each Role */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-primary-text text-center mb-12">
          Built for Every Role
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-surface border border-border rounded-2xl p-8">
            <h3 className="text-xl font-bold text-primary-text mb-4">
              For Learners
            </h3>
            <ul className="space-y-3 text-secondary-text text-sm">
              <li className="flex gap-2">
                <span className="text-brand font-bold">&#10003;</span>
                Browse and enroll in curated courses
              </li>
              <li className="flex gap-2">
                <span className="text-brand font-bold">&#10003;</span>
                Ask the AI tutor lesson-specific questions
              </li>
              <li className="flex gap-2">
                <span className="text-brand font-bold">&#10003;</span>
                Track progress across all enrolled courses
              </li>
              <li className="flex gap-2">
                <span className="text-brand font-bold">&#10003;</span>
                Earn XP, badges, and certificates
              </li>
              <li className="flex gap-2">
                <span className="text-brand font-bold">&#10003;</span>
                Take notes and bookmark lessons
              </li>
            </ul>
          </div>
          <div className="bg-surface border-2 border-brand rounded-2xl p-8">
            <h3 className="text-xl font-bold text-primary-text mb-4">
              For Tutors
            </h3>
            <ul className="space-y-3 text-secondary-text text-sm">
              <li className="flex gap-2">
                <span className="text-brand font-bold">&#10003;</span>
                Create courses with chapters and video lessons
              </li>
              <li className="flex gap-2">
                <span className="text-brand font-bold">&#10003;</span>
                Upload videos with automatic encoding
              </li>
              <li className="flex gap-2">
                <span className="text-brand font-bold">&#10003;</span>
                Build quizzes and assessments
              </li>
              <li className="flex gap-2">
                <span className="text-brand font-bold">&#10003;</span>
                View learner engagement analytics
              </li>
              <li className="flex gap-2">
                <span className="text-brand font-bold">&#10003;</span>
                Receive ratings and written reviews
              </li>
            </ul>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-8">
            <h3 className="text-xl font-bold text-primary-text mb-4">
              For Organizations
            </h3>
            <ul className="space-y-3 text-secondary-text text-sm">
              <li className="flex gap-2">
                <span className="text-brand font-bold">&#10003;</span>
                Manage tutors and learner enrollments
              </li>
              <li className="flex gap-2">
                <span className="text-brand font-bold">&#10003;</span>
                Approve or reject courses before publishing
              </li>
              <li className="flex gap-2">
                <span className="text-brand font-bold">&#10003;</span>
                Access organization-wide analytics
              </li>
              <li className="flex gap-2">
                <span className="text-brand font-bold">&#10003;</span>
                Handle billing and subscriptions
              </li>
              <li className="flex gap-2">
                <span className="text-brand font-bold">&#10003;</span>
                Customize branding and onboarding flows
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center bg-surface border border-border rounded-2xl p-12">
        <h2 className="text-2xl font-bold text-primary-text mb-4">
          See ZERRA in Action
        </h2>
        <p className="text-secondary-text mb-6 max-w-xl mx-auto">
          Ready to explore how ZERRA can transform your teaching or learning
          experience? Get started for free today.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/pricing"
            className="bg-brand text-white px-6 py-3 rounded-full font-medium hover:bg-brand/90 transition-colors"
          >
            View Pricing
          </Link>
          <Link
            href="/contact"
            className="border border-border px-6 py-3 rounded-full font-medium text-primary-text hover:bg-surface-muted transition-colors"
          >
            Request a Demo
          </Link>
        </div>
      </div>
    </div>
  );
}
