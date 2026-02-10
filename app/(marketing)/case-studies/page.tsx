import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Case Studies",
  description: "Success stories from schools and learners using NSK.AI.",
};

export default function CaseStudiesPage() {
  return (
    <div className="max-w-4xl mx-auto prose dark:prose-invert">
      <h1>Customer Success Stories</h1>
      <p className="lead">
        See how institutions around the world are achieving better outcomes with
        NSK.AI.
      </p>

      <div className="grid gap-8 not-prose mt-12">
        {[
          {
            title: "Global Tech University",
            metric: "40% Increase in Course Completion",
            desc: "How a leading technical university used AI Tutors to support student learning after hours.",
          },
          {
            title: "CodeAcademy Online",
            metric: "2x Student Engagement",
            desc: "Implementing personalized learning pathways to keep students motivated and on track.",
          },
          {
            title: "Future Skills High",
            metric: "95% Teacher Satisfaction",
            desc: "Reducing administrative burden on teachers through automated grading and insights.",
          },
        ].map((study) => (
          <div
            key={study.title}
            className="bg-surface p-6 rounded-xl border border-border"
          >
            <h3 className="text-xl font-bold mb-2 text-primary-text">
              {study.title}
            </h3>
            <div className="text-brand font-bold text-lg mb-2">
              {study.metric}
            </div>
            <p className="text-secondary-text">{study.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
