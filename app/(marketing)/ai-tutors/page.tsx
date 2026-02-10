import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Tutors",
  description: "Meet your 24/7 personal learning assistants.",
};

export default function AITutorsPage() {
  return (
    <div className="max-w-4xl mx-auto prose dark:prose-invert">
      <h1>AI Tutors</h1>
      <p className="lead">
        Personalized guidance available whenever you need it.
      </p>

      <h2>Always Available</h2>
      <p>
        Our AI tutors never sleep. accessible 24/7 to answer questions, explain
        concepts, and provide feedback.
      </p>

      <h2>Adaptive Teaching Style</h2>
      <p>
        The AI adapts to your unique learning style, pace, and preferences for
        maximum retention.
      </p>

      <h2>Subject Mastery</h2>
      <p>
        From mathematics to literature, our tutors are experts in a wide range
        of academic subjects.
      </p>
    </div>
  );
}
