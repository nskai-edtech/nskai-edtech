import { Metadata } from "next";
import {
  Handshake,
  DollarSign,
  Eye,
  Megaphone,
  Zap,
  Users,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Partner Program | ZERRA by NSKAI",
  description:
    "Partner with NSKAI to expand access to AI-powered education. Revenue sharing, co-marketing, and early access to new features.",
};

const BENEFITS = [
  {
    icon: DollarSign,
    title: "Revenue Sharing",
    description:
      "Earn competitive commissions when learners you refer enroll in courses on ZERRA. Our transparent model ensures you benefit from every conversion.",
  },
  {
    icon: Megaphone,
    title: "Co-Marketing Opportunities",
    description:
      "Get featured on our platform, blog, and social channels. We promote our partners to ZERRA's growing community of learners and educators.",
  },
  {
    icon: Eye,
    title: "Early Access",
    description:
      "Be the first to try new AI features, platform updates, and integrations before they are released to the public.",
  },
  {
    icon: Users,
    title: "Dedicated Support",
    description:
      "Partners receive priority support and a dedicated point of contact to help with integration, content strategy, and growth.",
  },
  {
    icon: Zap,
    title: "API & Integration Access",
    description:
      "Get access to ZERRA's API for custom integrations, allowing you to embed AI-powered learning features into your own platforms.",
  },
  {
    icon: Handshake,
    title: "Joint Content Creation",
    description:
      "Collaborate with our team to create co-branded courses, case studies, and educational content that benefits both audiences.",
  },
];

const PARTNER_TYPES = [
  {
    title: "Educational Institutions",
    description:
      "Schools, universities, and training centers looking to offer AI-powered learning to their students and staff.",
  },
  {
    title: "Content Creators & Tutors",
    description:
      "Subject matter experts who want to publish high-quality courses on ZERRA and reach a global audience.",
  },
  {
    title: "Technology Partners",
    description:
      "SaaS companies, EdTech tools, and platforms looking to integrate ZERRA's AI tutoring capabilities.",
  },
  {
    title: "Affiliates & Influencers",
    description:
      "Education bloggers, YouTubers, and influencers who want to earn revenue by recommending ZERRA to their audience.",
  },
];

export default function PartnerProgramPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-block bg-brand/10 text-brand text-sm font-semibold px-4 py-2 rounded-full mb-6">
          Partner Program
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary-text mb-6">
          Let&apos;s Build the Future of{" "}
          <span className="text-brand">Education Together</span>
        </h1>
        <p className="text-lg text-secondary-text max-w-2xl mx-auto">
          Join NSKAI&apos;s partner ecosystem. Whether you&apos;re an
          institution, content creator, or technology provider — there&apos;s a
          place for you in the ZERRA community.
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-primary-text text-center mb-12">
          Partner Benefits
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BENEFITS.map((benefit) => (
            <div
              key={benefit.title}
              className="bg-surface border border-border rounded-2xl p-6"
            >
              <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-4">
                <benefit.icon className="w-6 h-6 text-brand" />
              </div>
              <h3 className="text-lg font-bold text-primary-text mb-2">
                {benefit.title}
              </h3>
              <p className="text-secondary-text text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Partner Types */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-primary-text text-center mb-12">
          Who Can Partner With Us?
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {PARTNER_TYPES.map((type) => (
            <div
              key={type.title}
              className="bg-surface border border-border rounded-xl p-6"
            >
              <h3 className="font-bold text-primary-text mb-2">{type.title}</h3>
              <p className="text-secondary-text text-sm leading-relaxed">
                {type.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center bg-brand/5 border border-brand/20 rounded-2xl p-12">
        <h2 className="text-2xl font-bold text-primary-text mb-4">
          Ready to Partner?
        </h2>
        <p className="text-secondary-text mb-6 max-w-xl mx-auto">
          Tell us about your organization and how you&apos;d like to
          collaborate. We&apos;ll get back to you within 48 hours.
        </p>
        <Link
          href="/contact"
          className="inline-block bg-brand text-white px-8 py-3 rounded-full font-medium hover:bg-brand/90 transition-colors"
        >
          Apply to Partner Program
        </Link>
      </div>
    </div>
  );
}
