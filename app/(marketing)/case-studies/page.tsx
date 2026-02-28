import { Metadata } from "next";
import { TrendingUp, Users, Clock, Award } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Case Studies | ZERRA by NSKAI",
  description:
    "See how institutions and educators are achieving better learning outcomes with ZERRA's AI-powered platform.",
};

const CASE_STUDIES = [
  {
    title: "Riverside Technical College",
    icon: TrendingUp,
    metric: "42% Increase in Course Completion",
    challenge:
      "Students were dropping off mid-course due to lack of real-time support outside classroom hours. Tutors could not respond to every question fast enough.",
    solution:
      "Implemented ZERRA's context-aware AI tutors across 15 programming courses. Students could ask questions about lesson content 24/7 and receive grounded, accurate answers.",
    result:
      "Course completion rates increased from 58% to 82% within one semester. Student satisfaction scores rose by 35%.",
    tags: ["AI Tutoring", "Higher Education", "Programming"],
  },
  {
    title: "LearnPath Online Academy",
    icon: Users,
    metric: "3x Increase in Student Engagement",
    challenge:
      "As a fully online academy, learner engagement was low. Students would enroll but rarely complete more than 30% of course content.",
    solution:
      "Leveraged ZERRA's gamification features (XP, progress tracking, and certificates). Enabled the wishlist and learning path features to keep learners returning.",
    result:
      "Average lesson completion per learner tripled. Certificate issuance increased by 200%, giving learners tangible proof of their achievements.",
    tags: ["Gamification", "Online Academy", "Certificates"],
  },
  {
    title: "Bright Minds High School",
    icon: Clock,
    metric: "12 Hours Saved Per Teacher Per Week",
    challenge:
      "Teachers spent excessive time on administrative tasks — grading quizzes, tracking student progress, and managing course materials across multiple tools.",
    solution:
      "Adopted ZERRA's organization dashboard with built-in quiz building, automatic progress tracking, and centralized course management. Admin approved all courses before publishing.",
    result:
      "Teachers reported saving 12+ hours per week. The organization admin could monitor all courses and learner metrics from a single dashboard.",
    tags: ["K-12", "Admin Tools", "Time Savings"],
  },
  {
    title: "ProSkills Training Corp",
    icon: Award,
    metric: "95% Learner Satisfaction Rate",
    challenge:
      "Corporate training programs lacked personalization. All employees received the same generic content regardless of their experience level.",
    solution:
      "Used ZERRA's learning paths to create role-specific curricula. The AI tutor adapted explanations to each learner's level, from beginner to advanced.",
    result:
      "Learner satisfaction jumped to 95%. Internal skill assessments showed measurable improvement across all departments within 3 months.",
    tags: ["Corporate Training", "Learning Paths", "AI Tutoring"],
  },
];

export default function CaseStudiesPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-block bg-brand/10 text-brand text-sm font-semibold px-4 py-2 rounded-full mb-6">
          Case Studies
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary-text mb-6">
          Real Results, <span className="text-brand">Real Impact</span>
        </h1>
        <p className="text-lg text-secondary-text max-w-3xl mx-auto">
          See how educational institutions and organizations are using ZERRA to
          improve learning outcomes, boost engagement, and save time.
        </p>
      </div>

      {/* Case Studies */}
      <div className="space-y-8 mb-20">
        {CASE_STUDIES.map((study) => (
          <div
            key={study.title}
            className="bg-surface border border-border rounded-2xl p-8 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="w-14 h-14 bg-brand/10 rounded-2xl flex items-center justify-center shrink-0">
                <study.icon className="w-7 h-7 text-brand" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <h3 className="text-xl font-bold text-primary-text">
                    {study.title}
                  </h3>
                  <div className="text-brand font-bold text-lg whitespace-nowrap">
                    {study.metric}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold text-primary-text text-sm mb-1">
                      Challenge
                    </h4>
                    <p className="text-secondary-text text-sm leading-relaxed">
                      {study.challenge}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary-text text-sm mb-1">
                      Solution
                    </h4>
                    <p className="text-secondary-text text-sm leading-relaxed">
                      {study.solution}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary-text text-sm mb-1">
                      Result
                    </h4>
                    <p className="text-secondary-text text-sm leading-relaxed">
                      {study.result}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {study.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-surface-muted text-secondary-text px-2.5 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center bg-surface border border-border rounded-2xl p-12">
        <h2 className="text-2xl font-bold text-primary-text mb-4">
          Ready to Write Your Own Success Story?
        </h2>
        <p className="text-secondary-text mb-6 max-w-xl mx-auto">
          Join the growing list of institutions achieving better outcomes with
          ZERRA. Let&apos;s discuss how we can help your organization.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/contact"
            className="bg-brand text-white px-6 py-3 rounded-full font-medium hover:bg-brand/90 transition-colors"
          >
            Contact Us
          </Link>
          <Link
            href="/for-schools"
            className="border border-border px-6 py-3 rounded-full font-medium text-primary-text hover:bg-surface-muted transition-colors"
          >
            Solutions for Schools
          </Link>
        </div>
      </div>
    </div>
  );
}
