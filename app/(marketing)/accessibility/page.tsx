import { Metadata } from "next";
import { Accessibility, Monitor, Keyboard, Eye, Volume2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Accessibility | ZERRA by NSKAI",
  description:
    "Our commitment to making ZERRA accessible to all learners, including those with disabilities.",
};

const FEATURES = [
  {
    icon: Monitor,
    title: "Responsive Design",
    description:
      "ZERRA is fully responsive and works across all screen sizes — desktop, tablet, and mobile — ensuring learners can study from any device.",
  },
  {
    icon: Keyboard,
    title: "Keyboard Navigation",
    description:
      "All core platform features are accessible via keyboard navigation. Interactive elements have visible focus indicators for users who do not use a mouse.",
  },
  {
    icon: Eye,
    title: "High Contrast & Dark Mode",
    description:
      "ZERRA supports both light and dark modes with accessible color contrast ratios. We aim for WCAG AA compliance on text readability.",
  },
  {
    icon: Volume2,
    title: "Video Accessibility",
    description:
      "Our video player supports adaptive streaming for varying connection speeds. We are working toward adding closed captions and transcripts for all course content.",
  },
];

export default function AccessibilityPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-block bg-brand/10 text-brand text-sm font-semibold px-4 py-2 rounded-full mb-6">
          Accessibility
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary-text mb-6">
          Education for <span className="text-brand">Everyone</span>
        </h1>
        <p className="text-lg text-secondary-text max-w-3xl mx-auto">
          NSKAI is committed to ensuring that ZERRA is accessible to all
          learners, including people with disabilities. We continuously work to
          improve the user experience and apply relevant accessibility
          standards.
        </p>
      </div>

      {/* Conformance */}
      <div className="bg-surface border border-border rounded-2xl p-8 mb-16">
        <div className="flex items-center gap-3 mb-4">
          <Accessibility className="w-6 h-6 text-brand" />
          <h2 className="text-2xl font-bold text-primary-text">
            Conformance Status
          </h2>
        </div>
        <p className="text-secondary-text leading-relaxed mb-4">
          The Web Content Accessibility Guidelines (WCAG) define requirements
          for making web content more accessible to people with disabilities.
          WCAG defines three levels of conformance: Level A, Level AA, and Level
          AAA.
        </p>
        <p className="text-secondary-text leading-relaxed">
          ZERRA is <strong>partially conformant with WCAG 2.1 Level AA</strong>.
          We are actively working to achieve full conformance across all
          platform features. Accessibility is an ongoing effort, and we
          regularly audit our platform to identify and address gaps.
        </p>
      </div>

      {/* Features Grid */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-primary-text text-center mb-12">
          Accessibility Features
        </h2>
        <div className="grid sm:grid-cols-2 gap-8">
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
      </div>

      {/* Ongoing Work */}
      <div className="prose dark:prose-invert max-w-4xl mx-auto mb-16">
        <h2>What We&apos;re Working On</h2>
        <p>
          Accessibility is a journey, not a destination. Here are areas we are
          actively improving:
        </p>
        <ul>
          <li>
            Adding closed captions and full transcripts to all video lessons.
          </li>
          <li>
            Improving screen reader compatibility across the course player and
            dashboard.
          </li>
          <li>
            Enhancing ARIA labels and semantic HTML throughout the platform.
          </li>
          <li>
            Conducting regular accessibility audits with automated and manual
            testing.
          </li>
          <li>
            Gathering feedback from users with diverse abilities to guide
            improvements.
          </li>
        </ul>

        <h2>Provide Feedback</h2>
        <p>
          We welcome your feedback on the accessibility of ZERRA. If you
          encounter accessibility barriers or have suggestions for improvement,
          please reach out:
        </p>
        <ul>
          <li>
            Email: <a href="mailto:contact@nskai.org">contact@nskai.org</a>
          </li>
        </ul>
        <p>
          We aim to respond to accessibility feedback within 5 business days and
          will work with you to resolve any issues.
        </p>
      </div>
    </div>
  );
}
