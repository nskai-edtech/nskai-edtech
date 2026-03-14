import { Metadata } from "next";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing Plans | ZERRA by NSKAI",
  description:
    "Flexible pricing for learners, tutors, and institutions. Start learning for free or unlock the full power of ZERRA with Pro and Institutional plans.",
};

const PLANS = [
  {
    name: "Learner",
    price: "Free",
    period: "",
    description:
      "Get started with ZERRA at no cost. Browse courses, enroll in free content, and experience AI-assisted learning.",
    features: [
      "Access to all free courses",
      "Basic AI tutor assistance",
      "Progress tracking & XP",
      "Community access",
      "Course wishlist & bookmarks",
    ],
    cta: "Start Learning",
    ctaLink: "/",
    highlighted: false,
  },
  {
    name: "Pro Learner",
    price: "$19",
    period: "/month",
    description:
      "Unlimited access to premium courses, advanced AI tutoring, and verifiable certificates to showcase your skills.",
    features: [
      "Unlimited course enrollment",
      "Advanced AI tutor (full context)",
      "Certificates of completion",
      "Priority support",
      "Personalized learning paths",
      "Downloadable resources",
    ],
    cta: "Start Free Trial",
    ctaLink: "/",
    highlighted: true,
    badge: "MOST POPULAR",
  },
  {
    name: "Institution",
    price: "Custom",
    period: "",
    description:
      "For schools, universities, and organizations that need a complete LMS with admin controls and dedicated support.",
    features: [
      "Everything in Pro Learner",
      "Organization admin dashboard",
      "Multi-tutor management",
      "Course approval workflows",
      "Learner enrollment management",
      "Organization-wide analytics",
      "Dedicated success manager",
      "Custom onboarding & branding",
    ],
    cta: "Contact Sales",
    ctaLink: "/contact",
    highlighted: false,
  },
];

const FAQ = [
  {
    q: "Can I switch plans later?",
    a: "Yes. You can upgrade from Free to Pro at any time. Your progress and enrolled courses are preserved when switching plans.",
  },
  {
    q: "Is there a free trial for Pro?",
    a: "Yes — Pro Learner comes with a 14-day free trial. No credit card required to start. Cancel anytime during the trial.",
  },
  {
    q: "How does course pricing work?",
    a: "Individual courses can be purchased separately, or you can access everything with a Pro Learner subscription. Free courses are always available to all users.",
  },
  {
    q: "What payment methods are supported?",
    a: "We support card payments through our secure payment processor. Institutions can arrange invoicing and bank transfers through our sales team.",
  },
  {
    q: "Can tutors use the platform for free?",
    a: "Yes. Tutors can create and publish courses at no cost. Tutors earn revenue when learners purchase their courses.",
  },
  {
    q: "What does the Institution plan include?",
    a: "The Institution plan includes a full admin dashboard, multi-tutor management, course approval workflows, organization-wide analytics, and a dedicated success manager. Contact us for custom pricing.",
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-block bg-brand/10 text-brand text-sm font-semibold px-4 py-2 rounded-full mb-6">
          Pricing
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary-text mb-6">
          Simple, Transparent <span className="text-brand">Pricing</span>
        </h1>
        <p className="text-lg text-secondary-text max-w-2xl mx-auto">
          Start learning for free. Upgrade when you&apos;re ready for unlimited
          access, advanced AI features, and certificates.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 mb-20">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl p-8 flex flex-col ${
              plan.highlighted
                ? "border-2 border-brand bg-surface relative"
                : "border border-border bg-surface"
            }`}
          >
            {plan.badge && (
              <div className="absolute top-0 right-0 bg-brand text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-2xl">
                {plan.badge}
              </div>
            )}
            <h3 className="text-lg font-semibold text-primary-text mb-2">
              {plan.name}
            </h3>
            <div className="text-3xl font-bold text-primary-text mb-1">
              {plan.price}
              {plan.period && (
                <span className="text-lg font-normal text-secondary-text">
                  {plan.period}
                </span>
              )}
            </div>
            <p className="text-secondary-text text-sm mb-6 leading-relaxed">
              {plan.description}
            </p>
            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-sm text-secondary-text"
                >
                  <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href={plan.ctaLink}
              className={`w-full py-2.5 px-4 rounded-lg font-medium text-center transition-colors ${
                plan.highlighted
                  ? "bg-brand text-white hover:bg-brand/90"
                  : "border border-border text-primary-text hover:bg-surface-muted"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      {/* For Tutors */}
      <div className="bg-surface border border-border rounded-2xl p-8 mb-20 flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-brand" />
            <span className="text-sm font-bold text-brand uppercase tracking-wide">
              For Tutors
            </span>
          </div>
          <h2 className="text-2xl font-bold text-primary-text mb-3">
            Create &amp; Sell Courses for Free
          </h2>
          <p className="text-secondary-text leading-relaxed">
            ZERRA empowers tutors to build and publish courses at zero cost. Use
            our course builder, upload videos, create quizzes, and start earning
            revenue when learners enroll. No upfront fees — we only succeed when
            you do.
          </p>
        </div>
        <Link
          href="/contact"
          className="shrink-0 bg-brand text-white px-6 py-3 rounded-full font-medium hover:bg-brand/90 transition-colors"
        >
          Become a Tutor
        </Link>
      </div>

      {/* FAQ */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-primary-text text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 max-w-4xl mx-auto">
          {FAQ.map((item) => (
            <div key={item.q}>
              <h3 className="font-bold text-primary-text mb-2">{item.q}</h3>
              <p className="text-secondary-text text-sm leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
