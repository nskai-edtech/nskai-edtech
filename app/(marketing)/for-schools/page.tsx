import { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Schools",
  description: "Enterprise solutions for educational institutions.",
};

export default function ForSchoolsPage() {
  return (
    <div className="max-w-4xl mx-auto prose dark:prose-invert">
      <h1>Education Solutions for Schools</h1>
      <p className="lead">
        Transform your classrooms with cutting-edge AI technology designed for
        educators.
      </p>

      <h2>Seamless Integration</h2>
      <p>
        Our platform integrates directly with your existing LMS (Canvas,
        Blackboard, Moodle) to provide a unified experience.
      </p>

      <h2>Automated Grading</h2>
      <p>
        Save teachers hundreds of hours with AI-assisted grading for
        assignments, quizzes, and essays.
      </p>

      <h2>Student Analytics</h2>
      <p>
        Identify at-risk students early with predictive analytics and engagement
        tracking.
      </p>

      <div className="bg-surface-muted p-6 rounded-xl border border-border not-prose mt-8">
        <h3 className="text-lg font-bold mb-2">
          Ready to transform your school?
        </h3>
        <p className="text-secondary-text mb-4">
          Contact our education team for a demo.
        </p>
        <a
          href="/contact"
          className="inline-block bg-brand text-white! no-underline! px-4 py-2 rounded-lg font-medium hover:bg-brand/90 transition-colors"
        >
          Schedule Demo
        </a>
      </div>
    </div>
  );
}
