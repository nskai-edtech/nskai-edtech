import Image from "next/image";
import { BookOpenText, School, BarChart3, Users, Zap } from "lucide-react";

const FEATURES = [
  {
    label: "Personalized Learning",
    icon: "BookOpenText",
    title: "Your curriculum, built by AI",
    description:
      "Our engine adapts in real-time to your pace, gaps, and goals — surfacing the right content at the right moment.",
    image: "learner-dashboard-light.png",
  },
  {
    label: "Task Collaboration",
    icon: "Users",
    title: "Learn alongside peers",
    description:
      "Join live study rooms, collaborate on projects, and get feedback from tutors and classmates in real time.",
    image: "course-marketplace-light.png",
  },
  {
    label: "Progress Analytics",
    icon: "BarChart3",
    title: "Track every milestone",
    description:
      "Detailed insights into hours studied, skills mastered, and projected completion — always visible, always motivating.",
    image: "tutor-analytics-screen-1.png",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-28 px-4 bg-surface">
      <div className="flex flex-col items-center gap-4 mb-16 text-center">
        <div className="bg-brand/10 text-brand text-xs font-semibold px-4 py-1.5 rounded-full tracking-wide uppercase">
          Features
        </div>
        <h2 className="text-3xl md:text-5xl font-bold text-primary-text max-w-2xl leading-tight">
          Everything you need to learn faster and go further
        </h2>
        <p className="text-secondary-text text-base md:text-lg max-w-xl">
          ZERRA brings together AI-powered tools, social learning, and deep
          analytics — seamlessly woven into one platform.
        </p>
      </div>

      {/* Hub spoke */}
      <div className="max-w-3xl mx-auto mb-16">
        {/* DESKTOP */}
        <div className="hidden md:flex items-center justify-between gap-2">
          <div className="flex flex-col gap-3 w-44">
            <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-4 py-3 shadow-sm text-sm font-medium text-primary-text">
              <BookOpenText className="w-4 h-4 text-brand" /> Adaptive
              Curriculum
            </div>
            <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-4 py-3 shadow-sm text-sm font-medium text-primary-text">
              <School className="w-4 h-4 text-brand" /> AI Mentorship
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center relative">
            <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-border -translate-y-1/2" />
            <div className="relative z-10 bg-primary-text text-surface rounded-full px-5 py-2.5 flex items-center gap-2 shadow-lg text-sm font-semibold whitespace-nowrap">
              <Zap className="w-4 h-4 text-brand" /> ZERRA AI
            </div>
          </div>
          <div className="flex flex-col gap-3 w-44 items-end">
            <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-4 py-3 shadow-sm text-sm font-medium text-primary-text">
              <Zap className="w-4 h-4 text-brand" /> Live Assessments
            </div>
            <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-4 py-3 shadow-sm text-sm font-medium text-primary-text">
              <Users className="w-4 h-4 text-brand" /> Peer Collaboration
            </div>
          </div>
        </div>

        {/* MOBILE: top nodes, hub, bottom nodes */}
        <div className="flex md:hidden flex-col items-center gap-3">
          <div className="flex gap-3 w-full">
            <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2.5 shadow-sm text-xs font-medium text-primary-text flex-1">
              <BookOpenText className="w-3.5 h-3.5 text-brand shrink-0" />{" "}
              Adaptive Curriculum
            </div>
            <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2.5 shadow-sm text-xs font-medium text-primary-text flex-1">
              <School className="w-3.5 h-3.5 text-brand shrink-0" /> AI
              Mentorship
            </div>
          </div>
          <div className="w-px h-4 border-l border-dashed border-border" />
          <div className="bg-primary-text text-surface rounded-full px-5 py-2.5 flex items-center gap-2 shadow-lg text-sm font-semibold">
            <Zap className="w-4 h-4 text-brand" /> ZERRA AI
          </div>
          <div className="w-px h-4 border-l border-dashed border-border" />
          <div className="flex gap-3 w-full">
            <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2.5 shadow-sm text-xs font-medium text-primary-text flex-1">
              <Zap className="w-3.5 h-3.5 text-brand shrink-0" /> Live
              Assessments
            </div>
            <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-2.5 shadow-sm text-xs font-medium text-primary-text flex-1">
              <Users className="w-3.5 h-3.5 text-brand shrink-0" /> Peer
              Collaboration
            </div>
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {FEATURES.map((feature) => (
          <div
            key={feature.label}
            className="flex flex-col bg-surface-muted border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-5 pb-3 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-secondary-text">
                <BarChart3 className="w-4 h-4 text-brand" />
                {feature.label}
              </div>
              <h3 className="text-base font-bold text-primary-text leading-snug">
                {feature.title}
              </h3>
              <p className="text-sm text-secondary-text leading-relaxed">
                {feature.description}
              </p>
            </div>
            <div className="mx-4 mb-4 rounded-xl overflow-hidden border border-border mt-2 bg-surface aspect-video">
              <Image
                src={`/${feature.image}`}
                alt={feature.title}
                width={400}
                height={225}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
