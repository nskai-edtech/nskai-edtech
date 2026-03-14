import { Metadata } from "next";
import { Download, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Press Kit | ZERRA by NSKAI",
  description:
    "Official brand assets, logos, color guidelines, and media information for ZERRA by NSKAI.",
};

const BRAND_COLORS = [
  { name: "Brand Red", hex: "#ff0004", textClass: "text-white" },
  { name: "Surface Light", hex: "#ffffff", border: true },
  { name: "Surface Dark", hex: "#0f172a", textClass: "text-white" },
  { name: "Primary Text", hex: "#111827", textClass: "text-white" },
];

export default function PressKitPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-block bg-brand/10 text-brand text-sm font-semibold px-4 py-2 rounded-full mb-6">
          Press Kit
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary-text mb-6">
          ZERRA <span className="text-brand">Brand Assets</span>
        </h1>
        <p className="text-lg text-secondary-text max-w-2xl mx-auto">
          Official logos, brand colors, and guidelines for media coverage of
          ZERRA by NSKAI. Please use these assets in accordance with our brand
          guidelines.
        </p>
      </div>

      {/* About ZERRA - For Press */}
      <div className="bg-surface border border-border rounded-2xl p-8 mb-16">
        <h2 className="text-2xl font-bold text-primary-text mb-4">
          About ZERRA
        </h2>
        <div className="text-secondary-text space-y-3 leading-relaxed">
          <p>
            <strong>ZERRA</strong> is an AI-powered learning management system
            built by <strong>NSKAI</strong>. The platform connects learners with
            expert-led video courses and provides context-aware AI tutoring that
            answers questions based on the actual lesson content.
          </p>
          <p>
            ZERRA serves three distinct user roles — <strong>Learners</strong>{" "}
            who consume courses and interact with AI tutors,{" "}
            <strong>Tutors</strong> who create and publish educational content,
            and <strong>Organizations</strong> that manage tutors, learners, and
            institutional analytics under a multi-tenant structure.
          </p>
          <p>
            Key capabilities include secure video streaming, gamification with
            XP and certificates, quiz and assessment tools, progress tracking,
            course reviews, learning paths, and a comprehensive admin dashboard
            for institutions.
          </p>
        </div>
      </div>

      {/* Logos */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-primary-text mb-8">Logos</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="border border-border p-8 rounded-2xl bg-white flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-[#ff0004] p-1.5 rounded-lg">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-black">ZERRA</span>
            </div>
            <p className="text-gray-500 text-sm">Light Background</p>
            <button className="flex items-center gap-2 text-sm text-[#ff0004] font-medium hover:underline">
              <Download className="w-4 h-4" /> Download SVG
            </button>
          </div>
          <div className="border border-border p-8 rounded-2xl bg-[#0f172a] flex flex-col items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-[#ff0004] p-1.5 rounded-lg">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">ZERRA</span>
            </div>
            <p className="text-gray-400 text-sm">Dark Background</p>
            <button className="flex items-center gap-2 text-sm text-[#ff0004] font-medium hover:underline">
              <Download className="w-4 h-4" /> Download SVG
            </button>
          </div>
        </div>
      </div>

      {/* Brand Colors */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-primary-text mb-8">
          Brand Colors
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {BRAND_COLORS.map((color) => (
            <div key={color.name} className="flex flex-col gap-2">
              <div
                className={`h-24 rounded-xl flex items-end p-3 ${color.border ? "border border-gray-200" : ""}`}
                style={{ backgroundColor: color.hex }}
              >
                <div
                  className={`text-xs font-mono ${color.textClass || "text-gray-900"}`}
                >
                  {color.hex}
                </div>
              </div>
              <div className="text-sm font-medium text-primary-text">
                {color.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Brand Guidelines */}
      <div className="prose dark:prose-invert max-w-4xl mb-16">
        <h2>Usage Guidelines</h2>
        <ul>
          <li>
            Always use <strong>ZERRA</strong> in all caps when referring to the
            platform name.
          </li>
          <li>
            <strong>NSKAI</strong> refers to the organization behind ZERRA.
          </li>
          <li>Do not alter the logo colors, proportions, or add effects.</li>
          <li>
            Maintain clear space around the logo — at minimum, the width of the
            icon on all sides.
          </li>
          <li>
            When referencing the product in text, use &quot;ZERRA by NSKAI&quot;
            on first mention, then &quot;ZERRA&quot; for subsequent references.
          </li>
        </ul>
      </div>

      {/* Key Facts */}
      <div className="bg-surface border border-border rounded-2xl p-8 mb-16">
        <h2 className="text-2xl font-bold text-primary-text mb-6">Key Facts</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-bold text-primary-text">Platform Name:</span>{" "}
            <span className="text-secondary-text">ZERRA</span>
          </div>
          <div>
            <span className="font-bold text-primary-text">Organization:</span>{" "}
            <span className="text-secondary-text">NSKAI</span>
          </div>
          <div>
            <span className="font-bold text-primary-text">Founded:</span>{" "}
            <span className="text-secondary-text">2024</span>
          </div>
          <div>
            <span className="font-bold text-primary-text">Category:</span>{" "}
            <span className="text-secondary-text">
              AI-Powered Learning Management System
            </span>
          </div>
          <div>
            <span className="font-bold text-primary-text">Website:</span>{" "}
            <span className="text-secondary-text">nskai.org</span>
          </div>
          <div>
            <span className="font-bold text-primary-text">Key Feature:</span>{" "}
            <span className="text-secondary-text">
              Context-Aware AI Tutoring
            </span>
          </div>
        </div>
      </div>

      {/* Media Contact */}
      <div className="text-center bg-surface border border-border rounded-2xl p-12">
        <h2 className="text-2xl font-bold text-primary-text mb-4">
          Media Contact
        </h2>
        <p className="text-secondary-text mb-4">
          For press inquiries, interviews, or additional assets, please reach
          out to us.
        </p>
        <a
          href="mailto:contact@nskai.org"
          className="text-brand font-medium hover:underline text-lg"
        >
          contact@nskai.org
        </a>
      </div>
    </div>
  );
}
