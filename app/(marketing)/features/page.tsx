import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform Features",
  description: "Explore the powerful features of the NSK.AI learning platform.",
};

export default function FeaturesPage() {
  return (
    <div className="max-w-4xl mx-auto prose dark:prose-invert">
      <h1>Platform Features</h1>
      <p className="lead">
        Discover how NSK.AI is revolutionizing education with AI-driven tools.
      </p>

      <h2>Interactive Learning</h2>
      <p>
        Our platform provides an immersive learning experience with real-time
        feedback and personalized pathways.
      </p>

      <h2>AI-Powered Assessment</h2>
      <p>
        Get instant grading and detailed insights into student performance using
        our advanced AI models.
      </p>

      <h2>Content Management</h2>
      <p>
        Easily create, organize, and distribute educational content to learners
        worldwide.
      </p>
    </div>
  );
}
