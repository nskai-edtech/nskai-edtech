import { Metadata } from "next";
import {
  Globe,
  GraduationCap,
  Lightbulb,
  Heart,
  Users,
  Target,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | ZERRA by NSKAI",
  description:
    "Learn about NSKAI and how ZERRA is transforming education through AI-powered personalized learning for students, tutors, and institutions worldwide.",
};

const VALUES = [
  {
    icon: Lightbulb,
    title: "Innovation First",
    description:
      "We harness cutting-edge AI to reimagine how people teach and learn, turning complex subjects into engaging, personalized experiences.",
  },
  {
    icon: Globe,
    title: "Accessible Education",
    description:
      "Quality education should have no borders. ZERRA is built for learners everywhere — regardless of location, background, or budget.",
  },
  {
    icon: Heart,
    title: "Learner-Centric Design",
    description:
      "Every feature starts with one question: does this make the learner's journey better? From AI tutors to progress tracking, learners come first.",
  },
  {
    icon: Users,
    title: "Empowering Educators",
    description:
      "Tutors are the backbone of education. We give them powerful tools to create courses, track engagement, and focus on what they do best — teaching.",
  },
];

const MILESTONES = [
  {
    year: "2024",
    title: "NSKAI Founded",
    description:
      "The idea was born: build an LMS that places AI at the heart of the learning experience.",
  },
  {
    year: "2024",
    title: "ZERRA Platform Launched",
    description:
      "First version of ZERRA went live with course creation, video streaming, and AI-assisted learning.",
  },
  {
    year: "2025",
    title: "Gamification & Certificates",
    description:
      "Introduced XP-based gamification, verifiable certificates of completion, and learning paths.",
  },
  {
    year: "2026",
    title: "Scaling Globally",
    description:
      "Expanding institutional partnerships, multi-language support, and advanced AI tutor models.",
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-block bg-brand/10 text-brand text-sm font-semibold px-4 py-2 rounded-full mb-6">
          About NSKAI
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary-text mb-6">
          Building the Future of Education with{" "}
          <span className="text-brand">AI</span>
        </h1>
        <p className="text-lg md:text-xl text-secondary-text max-w-3xl mx-auto leading-relaxed">
          NSKAI is the organization behind ZERRA — an AI-powered learning
          management system that connects learners with expert-led courses and
          24/7 intelligent tutoring. We believe everyone deserves a personal
          tutor, and AI makes that possible at scale.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-8 mb-20">
        <div className="bg-surface border border-border rounded-2xl p-8">
          <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-4">
            <Target className="w-6 h-6 text-brand" />
          </div>
          <h2 className="text-2xl font-bold text-primary-text mb-3">
            Our Mission
          </h2>
          <p className="text-secondary-text leading-relaxed">
            To provide accessible, personalized, and effective learning
            experiences to anyone, anywhere in the world. We combine the
            expertise of human tutors with the power of artificial intelligence
            to make high-quality education available at scale — not just for the
            privileged few.
          </p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-8">
          <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-brand" />
          </div>
          <h2 className="text-2xl font-bold text-primary-text mb-3">
            Our Vision
          </h2>
          <p className="text-secondary-text leading-relaxed">
            A world where every learner has access to a personal AI tutor that
            understands their pace, style, and goals. Where tutors are empowered
            with intelligent tools that handle the busywork so they can focus on
            inspiring students. Where institutions can scale quality education
            without compromise.
          </p>
        </div>
      </div>

      {/* How ZERRA Works */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-primary-text text-center mb-4">
          How ZERRA Works
        </h2>
        <p className="text-secondary-text text-center max-w-2xl mx-auto mb-12">
          ZERRA serves three distinct audiences, each with a tailored experience
          designed for their specific needs.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-surface border border-border rounded-2xl p-6 text-center">
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-primary-text mb-2">
              Learners
            </h3>
            <p className="text-secondary-text text-sm leading-relaxed">
              Browse the course marketplace, enroll in expert-led video courses,
              ask the AI tutor questions in context, earn XP, and collect
              certificates upon completion.
            </p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-6 text-center">
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-primary-text mb-2">Tutors</h3>
            <p className="text-secondary-text text-sm leading-relaxed">
              Create structured courses with chapters and lessons, upload
              high-quality videos, build quizzes, track student engagement, and
              receive reviews — all from a powerful dashboard.
            </p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-6 text-center">
            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Globe className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-primary-text mb-2">
              Organizations
            </h3>
            <p className="text-secondary-text text-sm leading-relaxed">
              Manage multiple tutors and learners under one roof. Approve
              courses, view analytics dashboards, handle billing, and maintain
              quality standards across the board.
            </p>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-primary-text text-center mb-12">
          What We Stand For
        </h2>
        <div className="grid sm:grid-cols-2 gap-8">
          {VALUES.map((value) => (
            <div key={value.title} className="flex gap-4">
              <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center shrink-0">
                <value.icon className="w-6 h-6 text-brand" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary-text mb-1">
                  {value.title}
                </h3>
                <p className="text-secondary-text text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-primary-text text-center mb-12">
          Our Journey
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {MILESTONES.map((milestone, i) => (
            <div
              key={i}
              className="bg-surface border border-border rounded-xl p-5 relative"
            >
              <div className="text-brand text-sm font-bold mb-1">
                {milestone.year}
              </div>
              <h3 className="font-bold text-primary-text mb-1">
                {milestone.title}
              </h3>
              <p className="text-secondary-text text-sm">
                {milestone.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center bg-surface border border-border rounded-2xl p-12 mb-8">
        <h2 className="text-2xl font-bold text-primary-text mb-4">
          Ready to Experience ZERRA?
        </h2>
        <p className="text-secondary-text mb-6 max-w-xl mx-auto">
          Whether you&apos;re a learner looking to upskill, a tutor ready to
          share your expertise, or an institution seeking a modern LMS — ZERRA
          has you covered.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/features"
            className="bg-brand text-white px-6 py-3 rounded-full font-medium hover:bg-brand/90 transition-colors"
          >
            Explore Features
          </Link>
          <Link
            href="/contact"
            className="border border-border px-6 py-3 rounded-full font-medium text-primary-text hover:bg-surface-muted transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  );
}
