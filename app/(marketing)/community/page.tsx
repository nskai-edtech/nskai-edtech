import { Metadata } from "next";
import { Users, MessageSquare, Calendar, BookOpen } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Community | ZERRA by NSKAI",
  description:
    "Connect with educators, learners, and developers in the ZERRA community. Share knowledge, get help, and grow together.",
};

const COMMUNITY_FEATURES = [
  {
    icon: MessageSquare,
    title: "Discussion Forums",
    description:
      "Ask questions, share insights, and engage with fellow learners and tutors. Get help with courses, share your projects, and learn from others experiences.",
  },
  {
    icon: Users,
    title: "Tutor Network",
    description:
      "Connect with ZERRA tutors, discuss teaching strategies, and collaborate on creating better educational content for learners worldwide.",
  },
  {
    icon: Calendar,
    title: "Events & Webinars",
    description:
      "Join live webinars, workshops, and virtual meetups hosted by the NSKAI team and guest educators. Learn about new features and EdTech best practices.",
  },
  {
    icon: BookOpen,
    title: "Knowledge Base",
    description:
      "A community-curated collection of tips, guides, and best practices for getting the most out of the ZERRA platform - contributed by tutors and learners alike.",
  },
];

const UPCOMING_EVENTS = [
  {
    title: "AI in Education: What Works and What Doesn't",
    type: "Webinar",
    date: "March 15, 2026",
    description:
      "A panel discussion on the real-world impact of AI tutoring in online and hybrid learning environments.",
  },
  {
    title: "ZERRA Course Creation Masterclass",
    type: "Workshop",
    date: "March 28, 2026",
    description:
      "A hands-on workshop for tutors on creating engaging, high-quality courses using the ZERRA course builder.",
  },
  {
    title: "NSKAI Community Meetup",
    type: "Virtual Meetup",
    date: "April 10, 2026",
    description:
      "Meet the NSKAI team, share feedback, see upcoming features, and connect with other community members.",
  },
];

export default function CommunityPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-block bg-brand/10 text-brand text-sm font-semibold px-4 py-2 rounded-full mb-6">
          Community
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary-text mb-6">
          Learn Together, <span className="text-brand">Grow Together</span>
        </h1>
        <p className="text-lg text-secondary-text max-w-2xl mx-auto">
          The ZERRA community brings together learners, tutors, and developers
          who are passionate about the future of education. Share knowledge,
          get support, and contribute to a growing ecosystem.
        </p>
      </div>

      {/* Coming Soon Banner */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-16 flex flex-col sm:flex-row items-start gap-4">
        <div className="w-10 h-10 bg-amber-200 dark:bg-amber-800 rounded-lg flex items-center justify-center shrink-0">
          <Calendar className="w-5 h-5 text-amber-700 dark:text-amber-300" />
        </div>
        <div>
          <h3 className="font-bold text-amber-800 dark:text-amber-200 mb-1">
            Community Platform Launching Soon
          </h3>
          <p className="text-amber-700 dark:text-amber-300 text-sm leading-relaxed">
            We are building a dedicated community space for ZERRA users. In the
            meantime, reach out to us at{" "}
            <a
              href="mailto:contact@nskai.org"
              className="font-medium underline"
            >
              contact@nskai.org
            </a>{" "}
            to join early access or share feedback.
          </p>
        </div>
      </div>

      {/* Community Features */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-primary-text text-center mb-12">
          What&apos;s Coming
        </h2>
        <div className="grid sm:grid-cols-2 gap-8">
          {COMMUNITY_FEATURES.map((feature) => (
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
      </div>

      {/* Upcoming Events */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-primary-text text-center mb-12">
          Upcoming Events
        </h2>
        <div className="space-y-4">
          {UPCOMING_EVENTS.map((event) => (
            <div
              key={event.title}
              className="bg-surface border border-border rounded-xl p-6 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="shrink-0">
                <div className="text-xs font-bold text-brand uppercase tracking-wide mb-1">
                  {event.type}
                </div>
                <div className="text-sm text-secondary-text">{event.date}</div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-primary-text mb-1">
                  {event.title}
                </h3>
                <p className="text-secondary-text text-sm">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center bg-surface border border-border rounded-2xl p-12">
        <h2 className="text-2xl font-bold text-primary-text mb-4">
          Stay in the Loop
        </h2>
        <p className="text-secondary-text mb-6 max-w-xl mx-auto">
          Be the first to know when our community platform launches. Follow us
          for updates and join the conversation.
        </p>
        <Link
          href="/contact"
          className="inline-block bg-brand text-white px-6 py-3 rounded-full font-medium hover:bg-brand/90 transition-colors"
        >
          Get Early Access
        </Link>
      </div>
    </div>
  );
}
