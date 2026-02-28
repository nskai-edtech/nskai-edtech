import { Metadata } from "next";
import { Search, GraduationCap, Video, Settings, CreditCard, Brain, HelpCircle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Help Center | ZERRA by NSKAI",
  description:
    "Find answers to common questions about using the ZERRA platform, from account setup to AI tutoring and course management.",
};

const CATEGORIES = [
  {
    icon: GraduationCap,
    title: "Getting Started",
    description: "Account setup, onboarding, and first steps on ZERRA.",
    items: [
      "How do I create an account?",
      "How do I choose my role (Learner/Tutor)?",
      "How does the onboarding process work?",
      "How do I navigate the dashboard?",
    ],
  },
  {
    icon: Video,
    title: "Courses & Learning",
    description: "Enrolling in courses, watching lessons, and tracking progress.",
    items: [
      "How do I find and enroll in a course?",
      "How does video playback work?",
      "How is my progress tracked?",
      "How do I earn XP and certificates?",
    ],
  },
  {
    icon: Brain,
    title: "AI Tutor",
    description: "Using the AI tutor, asking questions, and understanding responses.",
    items: [
      "How does the AI tutor work?",
      "Why are AI answers based on lesson content?",
      "Can I ask follow-up questions?",
      "Is my conversation with the AI private?",
    ],
  },
  {
    icon: Settings,
    title: "For Tutors",
    description: "Creating courses, uploading videos, building quizzes, and analytics.",
    items: [
      "How do I create a new course?",
      "How do I upload videos?",
      "How do I add quizzes to a lesson?",
      "How do I view my course analytics?",
    ],
  },
  {
    icon: CreditCard,
    title: "Payments & Billing",
    description: "Purchasing courses, subscriptions, and billing questions.",
    items: [
      "How do I purchase a course?",
      "What payment methods are accepted?",
      "How do I upgrade to Pro?",
      "How do refunds work?",
    ],
  },
  {
    icon: HelpCircle,
    title: "Troubleshooting",
    description: "Common issues with login, video playback, and browser support.",
    items: [
      "I can't log into my account",
      "Video is not playing properly",
      "Which browsers are supported?",
      "How do I reset my password?",
    ],
  },
];

export default function HelpCenterPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-block bg-brand/10 text-brand text-sm font-semibold px-4 py-2 rounded-full mb-6">
          Help Center
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary-text mb-6">
          How Can We <span className="text-brand">Help</span>?
        </h1>
        <div className="max-w-xl mx-auto relative">
          <input
            type="text"
            placeholder="Search for help articles..."
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-surface shadow-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
          />
          <Search className="absolute left-4 top-4 text-secondary-text w-5 h-5" />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
        {CATEGORIES.map((category) => (
          <div
            key={category.title}
            className="bg-surface border border-border rounded-2xl p-6"
          >
            <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-4">
              <category.icon className="w-6 h-6 text-brand" />
            </div>
            <h3 className="font-bold text-lg text-primary-text mb-1">
              {category.title}
            </h3>
            <p className="text-secondary-text text-xs mb-4">
              {category.description}
            </p>
            <ul className="space-y-2">
              {category.items.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-brand hover:underline text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Still Need Help */}
      <div className="text-center bg-surface border border-border rounded-2xl p-12">
        <h2 className="text-2xl font-bold text-primary-text mb-4">
          Still Need Help?
        </h2>
        <p className="text-secondary-text mb-6 max-w-xl mx-auto">
          Can&apos;t find what you&apos;re looking for? Our team is ready to
          assist you with any questions about the ZERRA platform.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/contact"
            className="bg-brand text-white px-6 py-3 rounded-full font-medium hover:bg-brand/90 transition-colors"
          >
            Contact Support
          </Link>
          <Link
            href="/documentation"
            className="border border-border px-6 py-3 rounded-full font-medium text-primary-text hover:bg-surface-muted transition-colors"
          >
            Browse Documentation
          </Link>
        </div>
      </div>
    </div>
  );
}
