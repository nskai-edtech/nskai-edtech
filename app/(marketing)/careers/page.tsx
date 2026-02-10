import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join our team and help shape the future of education.",
};

export default function CareersPage() {
  return (
    <div className="max-w-4xl mx-auto prose dark:prose-invert">
      <h1>Careers at NSK AI</h1>
      <p className="lead">
        Join a team of passionate educators, engineers, and designers building
        the next generation of learning tools.
      </p>

      <h2>Open Positions</h2>
      <div className="not-prose grid gap-6 mt-8">
        {[
          {
            title: "Senior AI Engineer",
            location: "Remote",
            type: "Full-time",
          },
          { title: "Product Designer", location: "Remote", type: "Full-time" },
          {
            title: "Customer Success Manager",
            location: "New York, NY",
            type: "Full-time",
          },
          {
            title: "Content Strategist",
            location: "London, UK",
            type: "Part-time",
          },
        ].map((job) => (
          <div
            key={job.title}
            className="flex items-center justify-between p-6 bg-surface border border-border rounded-xl hover:border-brand transition-colors cursor-pointer group"
          >
            <div>
              <h3 className="font-bold text-lg text-primary-text group-hover:text-brand transition-colors">
                {job.title}
              </h3>
              <div className="flex gap-4 text-sm text-secondary-text mt-1">
                <span>{job.location}</span>
                <span>•</span>
                <span>{job.type}</span>
              </div>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-brand bg-brand/5 rounded-lg group-hover:bg-brand/10 transition-colors">
              Apply Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
