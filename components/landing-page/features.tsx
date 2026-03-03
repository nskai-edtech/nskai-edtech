import Image from "next/image";
import { BookOpenText, School, BarChart3, Users, Zap } from "lucide-react";

// Hub spoke nodes
const leftNodes = [
  { label: "Adaptive Curriculum", icon: <BookOpenText className="w-4 h-4" /> },
  { label: "AI Mentorship", icon: <School className="w-4 h-4" /> },
];
const rightNodes = [
  { label: "Live Assessments", icon: <Zap className="w-4 h-4" /> },
  { label: "Peer Collaboration", icon: <Users className="w-4 h-4" /> },
];

// Feature cards
const FEATURES = [
  {
    label: "Personalized Learning",
    icon: <BookOpenText className="w-4 h-4" />,
    title: "Your curriculum, built by AI",
    description:
      "Our engine adapts in real-time to your pace, gaps, and goals — surfacing the right content at the right moment.",
    image: "learner-dashboard-light.png",
    accent: "#f3e8ff",
    accentDark: "#2d1a4a",
  },
  {
    label: "Task Collaboration",
    icon: <Users className="w-4 h-4" />,
    title: "Learn alongside peers",
    description:
      "Join live study rooms, collaborate on projects, and get feedback from tutors and classmates in real time.",
    image: "course-marketplace-light.png",
    accent: "#e0f2fe",
    accentDark: "#0c2a3e",
  },
  {
    label: "Progress Analytics",
    icon: <BarChart3 className="w-4 h-4" />,
    title: "Track every milestone",
    description:
      "Detailed insights into hours studied, skills mastered, and projected completion — always visible, always motivating.",
    image: "tutor-analytics-screen-1.png",
    accent: "#fef9c3",
    accentDark: "#2e2600",
  },
];

function FeaturesSection() {
  return (
    <section className="py-28 px-4 bg-surface">
      {/* Heading */}
      <div className="flex flex-col items-center gap-4 mb-16 text-center">
        <div className="bg-brand/10 text-brand text-xs font-semibold px-4 py-1.5 rounded-full tracking-wide uppercase">
          ✦ Features
        </div>
        <h2 className="text-3xl md:text-5xl font-bold text-primary-text max-w-2xl leading-tight">
          Everything you need to learn faster and go further
        </h2>
        <p className="text-secondary-text text-base md:text-lg max-w-xl">
          ZERRA brings together AI-powered tools, social learning, and deep
          analytics — seamlessly woven into one platform.
        </p>
      </div>

      {/* Hub & Spoke diagram */}
      <div className="relative flex items-center justify-center mb-16 select-none">
        <div
          className="relative w-full max-w-2xl mx-auto"
          style={{ height: 160 }}
        >
          {/* Left nodes */}
          <div className="absolute left-0 top-0 flex flex-col gap-4 w-48">
            {leftNodes.map((node) => (
              <div
                key={node.label}
                className="flex items-center gap-2 bg-surface border border-border rounded-xl px-4 py-3 shadow-sm text-sm font-medium text-primary-text"
              >
                <span className="text-brand">{node.icon}</span>
                {node.label}
              </div>
            ))}
          </div>

          {/* SVG lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Left top */}
            <line
              x1="192"
              y1="30"
              x2="50%"
              y2="50%"
              stroke="var(--app-border)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            {/* Left bottom */}
            <line
              x1="192"
              y1="122"
              x2="50%"
              y2="50%"
              stroke="var(--app-border)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            {/* Right top */}
            <line
              x1="calc(100% - 192px)"
              y1="30"
              x2="50%"
              y2="50%"
              stroke="var(--app-border)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            {/* Right bottom */}
            <line
              x1="calc(100% - 192px)"
              y1="122"
              x2="50%"
              y2="50%"
              stroke="var(--app-border)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            {/* Down to cards */}
            <line
              x1="50%"
              y1="90"
              x2="50%"
              y2="160"
              stroke="var(--app-border)"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
          </svg>

          {/* Center hub */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary-text text-surface rounded-full px-6 py-3 flex items-center gap-2 shadow-lg text-sm font-semibold z-10 whitespace-nowrap">
            <Zap className="w-4 h-4 text-brand" />
            ZERRA AI
          </div>

          {/* Right nodes */}
          <div className="absolute right-0 top-0 flex flex-col gap-4 w-48 items-end">
            {rightNodes.map((node) => (
              <div
                key={node.label}
                className="flex items-center gap-2 bg-surface border border-border rounded-xl px-4 py-3 shadow-sm text-sm font-medium text-primary-text"
              >
                <span className="text-brand">{node.icon}</span>
                {node.label}
              </div>
            ))}
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
            {/* Card header */}
            <div className="p-5 pb-3 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-secondary-text">
                <span className="text-brand">{feature.icon}</span>
                {feature.label}
              </div>
              <h3 className="text-base font-bold text-primary-text leading-snug">
                {feature.title}
              </h3>
              <p className="text-sm text-secondary-text leading-relaxed">
                {feature.description}
              </p>
            </div>

            {/* Mini UI mockup */}
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

export default FeaturesSection;
