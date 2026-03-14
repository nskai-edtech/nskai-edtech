import { Metadata } from "next";
import {
  Brain,
  Clock,
  BookOpen,
  MessageCircle,
  Sparkles,
  GraduationCap,
  Zap,
  Shield,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Tutors | ZERRA by NSKAI",
  description:
    "Meet ZERRA's context-aware AI tutors — available 24/7 to answer questions, explain concepts, and guide your learning based on actual course content.",
};

const CAPABILITIES = [
  {
    icon: BookOpen,
    title: "Context-Aware Responses",
    description:
      "Unlike generic chatbots, ZERRA's AI reads the lesson transcript you're currently watching. When you ask a question about React Hooks in Lesson 3, the AI answers using the exact material your tutor taught — not random internet results.",
  },
  {
    icon: Clock,
    title: "Available 24/7",
    description:
      "Learning doesn't follow a schedule. Whether it's 2 AM before an exam or a quick question during lunch, your AI tutor is always online and ready to help — no appointments, no wait times.",
  },
  {
    icon: Sparkles,
    title: "Adaptive Explanations",
    description:
      "Confused by a complex concept? The AI adjusts its explanation style. Ask it to 'explain like I'm a beginner' or 'give me the advanced version' — it adapts to your understanding level instantly.",
  },
  {
    icon: MessageCircle,
    title: "Conversational Learning",
    description:
      "Have a natural back-and-forth conversation. Ask follow-up questions, request examples, or ask the AI to quiz you on the material. It maintains the context of your entire conversation.",
  },
  {
    icon: GraduationCap,
    title: "Multi-Subject Expertise",
    description:
      "From programming and data science to business, design, and languages — ZERRA's AI tutors are knowledgeable across every subject area offered on the platform.",
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    description:
      "Get immediate, detailed feedback on your quiz answers and assessments. Understand not just what the right answer is, but why — reinforcing deeper comprehension.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Watch a Lesson",
    description:
      "Start any video lesson in your enrolled course. The AI tutor automatically loads the context of that lesson.",
  },
  {
    step: "02",
    title: "Ask a Question",
    description:
      "Type your question in the AI chat panel. It could be about a specific concept, a request for an example, or help with an exercise.",
  },
  {
    step: "03",
    title: "Get a Contextual Answer",
    description:
      "The AI responds based on the actual lesson content — combining the tutor's material with its own knowledge to give you the best possible explanation.",
  },
  {
    step: "04",
    title: "Keep Learning",
    description:
      "Ask follow-ups, request quizzes, or move to the next lesson. Your AI tutor tracks the conversation and grows with you.",
  },
];

export default function AITutorsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-block bg-brand/10 text-brand text-sm font-semibold px-4 py-2 rounded-full mb-6">
          AI Tutors
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary-text mb-6">
          Your Personal <span className="text-brand">AI Tutor</span>,
          <br className="hidden md:block" /> Available Anytime
        </h1>
        <p className="text-lg text-secondary-text max-w-3xl mx-auto leading-relaxed">
          ZERRA&apos;s AI tutors are not generic chatbots. They are
          context-aware assistants that understand the exact lesson you&apos;re
          studying and answer your questions based on the actual course material
          — like having a private tutor who knows the syllabus inside and out.
        </p>
      </div>

      {/* Key Difference Callout */}
      <div className="bg-brand/5 border border-brand/20 rounded-2xl p-8 mb-20 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Brain className="w-8 h-8 text-brand" />
          <h2 className="text-2xl font-bold text-primary-text">
            What Makes ZERRA&apos;s AI Different?
          </h2>
        </div>
        <p className="text-secondary-text max-w-2xl mx-auto leading-relaxed">
          When you ask a question in <strong>Lesson 3: React Hooks</strong>, we
          send the transcript of that lesson to the AI along with your question.
          The result? Answers that are specific, accurate, and grounded in what
          your tutor actually taught — not hallucinated content from the general
          internet.
        </p>
      </div>

      {/* Capabilities Grid */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-primary-text text-center mb-12">
          AI Tutor Capabilities
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CAPABILITIES.map((cap) => (
            <div
              key={cap.title}
              className="bg-surface border border-border rounded-2xl p-6"
            >
              <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-4">
                <cap.icon className="w-6 h-6 text-brand" />
              </div>
              <h3 className="text-lg font-bold text-primary-text mb-2">
                {cap.title}
              </h3>
              <p className="text-secondary-text text-sm leading-relaxed">
                {cap.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-primary-text text-center mb-12">
          How It Works
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map((step) => (
            <div key={step.step} className="text-center">
              <div className="text-4xl font-bold text-brand/20 mb-3">
                {step.step}
              </div>
              <h3 className="font-bold text-primary-text mb-2">{step.title}</h3>
              <p className="text-secondary-text text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust & Safety */}
      <div className="bg-surface border border-border rounded-2xl p-8 mb-20">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-brand" />
          <h2 className="text-2xl font-bold text-primary-text">
            Safe & Responsible AI
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-primary-text mb-1">
              Content Grounding
            </h3>
            <p className="text-secondary-text text-sm leading-relaxed">
              AI responses are grounded in the lesson material provided by
              tutors, reducing hallucination and ensuring accuracy.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-primary-text mb-1">Privacy First</h3>
            <p className="text-secondary-text text-sm leading-relaxed">
              Your conversations with the AI tutor are private. We do not use
              your questions to train external models or share them with third
              parties.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center bg-brand/5 border border-brand/20 rounded-2xl p-12">
        <h2 className="text-2xl font-bold text-primary-text mb-4">
          Ready to Learn with AI?
        </h2>
        <p className="text-secondary-text mb-6 max-w-xl mx-auto">
          Start any course on ZERRA and experience the power of context-aware AI
          tutoring. Your first lesson is just a click away.
        </p>
        <Link
          href="/pricing"
          className="inline-block bg-brand text-white px-8 py-3 rounded-full font-medium hover:bg-brand/90 transition-colors"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}
