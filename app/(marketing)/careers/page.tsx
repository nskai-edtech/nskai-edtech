import { Metadata } from "next";
import { Heart, Zap, Globe, GraduationCap } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Careers | ZERRA by NSKAI",
  description:
    "Join the NSKAI team and help build the future of AI-powered education. Remote-first, mission-driven, and growing fast.",
};

const PERKS = [
  {
    icon: Globe,
    title: "Remote-First",
    description:
      "Work from anywhere in the world. Our team is distributed and we believe great talent is not confined to one timezone.",
  },
  {
    icon: Zap,
    title: "Impactful Work",
    description:
      "Every line of code you write directly impacts how people learn. You are not building another CRUD app — you are building the future of education.",
  },
  {
    icon: Heart,
    title: "Learning Culture",
    description:
      "We practice what we preach. Team members get dedicated learning time, conference budgets, and access to every course on ZERRA.",
  },
  {
    icon: GraduationCap,
    title: "Growth-Focused",
    description:
      "We are a growing startup with real traction. Join early, take ownership of critical systems, and grow with us.",
  },
];

const POSITIONS = [
  {
    title: "Senior Full Stack Engineer",
    location: "Remote",
    type: "Full-time",
    description:
      "Build and scale the ZERRA platform using Next.js, TypeScript, Drizzle ORM, and PostgreSQL. Work on AI integrations, video infrastructure, and the course management system.",
  },
  {
    title: "AI / ML Engineer",
    location: "Remote",
    type: "Full-time",
    description:
      "Design and improve our context-aware AI tutoring system. Work with LLMs, embeddings, and RAG pipelines to deliver accurate, lesson-grounded responses.",
  },
  {
    title: "Product Designer",
    location: "Remote",
    type: "Full-time",
    description:
      "Design intuitive interfaces for learners, tutors, and admins. Own the design system and craft experiences that make complex features feel simple.",
  },
  {
    title: "DevOps / Platform Engineer",
    location: "Remote",
    type: "Full-time",
    description:
      "Manage our serverless infrastructure, CI/CD pipelines, monitoring (Sentry), and deployment workflows. Ensure ZERRA is fast, reliable, and secure.",
  },
  {
    title: "Content & Community Manager",
    location: "Remote",
    type: "Part-time",
    description:
      "Build and nurture the ZERRA community. Create blog content, educational guides, social media presence, and engage with our growing user base.",
  },
];

export default function CareersPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-block bg-brand/10 text-brand text-sm font-semibold px-4 py-2 rounded-full mb-6">
          Careers
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary-text mb-6">
          Build the Future of <span className="text-brand">Education</span>
        </h1>
        <p className="text-lg text-secondary-text max-w-2xl mx-auto">
          NSKAI is on a mission to make quality education accessible to everyone
          through AI. Join our remote-first team and make an impact on how
          millions of people learn.
        </p>
      </div>

      {/* Perks */}
      <div className="grid sm:grid-cols-2 gap-6 mb-20">
        {PERKS.map((perk) => (
          <div
            key={perk.title}
            className="bg-surface border border-border rounded-2xl p-6 flex gap-4"
          >
            <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center shrink-0">
              <perk.icon className="w-6 h-6 text-brand" />
            </div>
            <div>
              <h3 className="font-bold text-primary-text mb-1">{perk.title}</h3>
              <p className="text-secondary-text text-sm leading-relaxed">
                {perk.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Open Positions */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-primary-text text-center mb-12">
          Open Positions
        </h2>
        <div className="space-y-4">
          {POSITIONS.map((job) => (
            <div
              key={job.title}
              className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-surface border border-border rounded-xl hover:border-brand/50 transition-colors group"
            >
              <div className="flex-1 mb-4 md:mb-0">
                <h3 className="font-bold text-lg text-primary-text group-hover:text-brand transition-colors">
                  {job.title}
                </h3>
                <p className="text-secondary-text text-sm mt-1 leading-relaxed">
                  {job.description}
                </p>
                <div className="flex gap-4 text-xs text-secondary-text mt-2">
                  <span>{job.location}</span>
                  <span>&middot;</span>
                  <span>{job.type}</span>
                </div>
              </div>
              <Link
                href="mailto:contact@nskai.org"
                className="shrink-0 px-5 py-2 text-sm font-medium text-brand bg-brand/5 rounded-lg group-hover:bg-brand/10 transition-colors text-center"
              >
                Apply Now
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* General Application */}
      <div className="text-center bg-surface border border-border rounded-2xl p-12">
        <h2 className="text-2xl font-bold text-primary-text mb-4">
          Don&apos;t See Your Role?
        </h2>
        <p className="text-secondary-text mb-6 max-w-xl mx-auto">
          We&apos;re always looking for talented people who are passionate about
          education and technology. Send us your resume and tell us how
          you&apos;d like to contribute.
        </p>
        <Link
          href="mailto:contact@nskai.org"
          className="inline-block bg-brand text-white px-6 py-3 rounded-full font-medium hover:bg-brand/90 transition-colors"
        >
          Send General Application
        </Link>
      </div>
    </div>
  );
}
