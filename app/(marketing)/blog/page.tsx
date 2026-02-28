import { Metadata } from "next";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog | ZERRA by NSKAI",
  description:
    "Stay updated with the latest insights on AI in education, platform updates, and learning strategies from the NSKAI team.",
};

const FEATURED_POST = {
  title: "How Context-Aware AI Tutors Are Changing Online Education",
  category: "AI & Education",
  date: "Feb 15, 2026",
  readTime: "6 min read",
  author: "NSKAI Team",
  excerpt:
    "Unlike generic chatbots, ZERRA's AI tutors read the lesson transcript before answering. Learn how this context-aware approach delivers dramatically better learning outcomes compared to traditional AI assistants.",
};

const POSTS = [
  {
    title: "5 Ways Gamification Boosts Course Completion Rates",
    category: "Product",
    date: "Feb 8, 2026",
    excerpt:
      "XP systems, certificates, and progress tracking aren't just engagement tricks — they fundamentally change how learners interact with course content.",
  },
  {
    title: "Building a Multi-Tenant LMS: Lessons From ZERRA's Architecture",
    category: "Engineering",
    date: "Jan 25, 2026",
    excerpt:
      "How we designed ZERRA to support Organizations, Tutors, and Learners under a single platform with strict role isolation and shared infrastructure.",
  },
  {
    title: "Why Video-First Learning Works: The Research Behind ZERRA",
    category: "Research",
    date: "Jan 12, 2026",
    excerpt:
      "Video completion tracking, secure streaming, and AI-powered Q&A together create a learning experience that outperforms text-only content.",
  },
  {
    title: "The Tutor's Guide to Creating Engaging Courses on ZERRA",
    category: "Guides",
    date: "Dec 28, 2025",
    excerpt:
      "Practical tips for structuring chapters, recording effective video lessons, writing quizzes, and using analytics to improve your teaching.",
  },
];

export default function BlogPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero */}
      <div className="mb-12">
        <div className="inline-block bg-brand/10 text-brand text-sm font-semibold px-4 py-2 rounded-full mb-6">
          Blog
        </div>
        <h1 className="text-4xl font-bold text-primary-text mb-4">
          ZERRA Blog
        </h1>
        <p className="text-xl text-secondary-text">
          Insights on AI-powered learning, EdTech trends, and platform updates
          from the NSKAI team.
        </p>
      </div>

      {/* Featured Post */}
      <div className="border border-border rounded-2xl overflow-hidden bg-surface hover:shadow-lg transition-shadow mb-12">
        <div className="aspect-[21/9] bg-gradient-to-br from-brand/10 to-brand/5 w-full relative flex items-center justify-center">
          <div className="text-brand/20 font-bold text-6xl">ZERRA</div>
        </div>
        <div className="p-8">
          <div className="text-brand text-sm font-bold mb-2 uppercase tracking-wide">
            {FEATURED_POST.category}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary-text">
            {FEATURED_POST.title}
          </h2>
          <p className="text-secondary-text mb-6 text-lg leading-relaxed">
            {FEATURED_POST.excerpt}
          </p>
          <div className="flex items-center justify-between">
            <div className="text-secondary-text text-sm">
              {FEATURED_POST.author} &middot; {FEATURED_POST.date} &middot;{" "}
              {FEATURED_POST.readTime}
            </div>
            <span className="flex items-center gap-1 text-brand font-medium text-sm cursor-pointer hover:gap-2 transition-all">
              Read More <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {POSTS.map((post, i) => (
          <div
            key={i}
            className="border border-border rounded-2xl overflow-hidden bg-surface hover:shadow-md transition-shadow flex flex-col"
          >
            <div className="aspect-video bg-gradient-to-br from-surface-muted to-surface w-full" />
            <div className="p-6 flex-1 flex flex-col">
              <div className="text-brand text-xs font-bold mb-2 uppercase tracking-wide">
                {post.category}
              </div>
              <h3 className="text-xl font-bold mb-3 text-primary-text flex-1">
                {post.title}
              </h3>
              <p className="text-secondary-text text-sm leading-relaxed mb-4">
                {post.excerpt}
              </p>
              <div className="text-secondary-text text-xs">{post.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
