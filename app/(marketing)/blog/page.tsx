import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Latest updates, insights, and stories from the NSK.AI team.",
};

export default function BlogPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-4 text-primary-text">NSK AI Blog</h1>
      <p className="text-xl text-secondary-text mb-12">
        Insights on API Learning, EdTech trends, and platform updates.
      </p>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Featured Post */}
        <div className="md:col-span-2 border border-border rounded-2xl overflow-hidden bg-surface hover:shadow-lg transition-shadow">
          <div className="aspect-21/9 bg-surface-muted w-full relative">
            <div className="absolute inset-0 flex items-center justify-center text-secondary-text/20 font-bold text-4xl">
              Featured Image
            </div>
          </div>
          <div className="p-8">
            <div className="text-brand text-sm font-bold mb-2 uppercase tracking-wide">
              Product Update
            </div>
            <h2 className="text-3xl font-bold mb-4 text-primary-text hover:text-brand transition-colors cursor-pointer">
              Introducing Advanced AI Tutor Models for STEM Subjects
            </h2>
            <p className="text-secondary-text mb-6 text-lg">
              We have upgraded our core AI models to provide deeper, more
              accurate explanations for complex mathematics and physics
              problems.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-muted" />
              <div>
                <div className="font-bold text-primary-text text-sm">
                  Sara Johnson
                </div>
                <div className="text-secondary-text text-xs">
                  Oct 12, 2025 • 5 min read
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Regular Posts */}
        {[
          {
            title: "The Future of Personalized Learning",
            category: "Thought Leadership",
            date: "Sep 28, 2025",
          },
          {
            title: "How to Create Engaging Course Content",
            category: "Guides",
            date: "Sep 15, 2025",
          },
        ].map((post, i) => (
          <div
            key={i}
            className="border border-border rounded-2xl overflow-hidden bg-surface hover:shadow-md transition-shadow flex flex-col"
          >
            <div className="aspect-video bg-surface-muted w-full" />
            <div className="p-6 flex-1 flex flex-col">
              <div className="text-brand text-xs font-bold mb-2 uppercase tracking-wide">
                {post.category}
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary-text hover:text-brand transition-colors cursor-pointer flex-1">
                {post.title}
              </h3>
              <div className="text-secondary-text text-xs mt-4">
                {post.date}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
