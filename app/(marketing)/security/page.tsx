import { Metadata } from "next";
import {
  ShieldCheck,
  Lock,
  Server,
  Eye,
  KeyRound,
  FileCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Security | ZERRA by NSKAI",
  description:
    "Learn about the enterprise-grade security measures that protect your data on the ZERRA platform.",
};

const SECURITY_MEASURES = [
  {
    icon: Lock,
    title: "Encryption Everywhere",
    description:
      "All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. This includes course content, user data, payment information, and AI conversations.",
  },
  {
    icon: KeyRound,
    title: "Secure Authentication",
    description:
      "ZERRA uses Clerk for enterprise-grade authentication with support for multi-factor authentication (MFA), passwordless login, Google/social sign-in, and secure session management.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access Control",
    description:
      "Strict separation between Learners, Tutors, and Organization Admins is enforced at both the UI and server levels. Even guessing a URL will not bypass our access controls — every server action verifies your identity and role.",
  },
  {
    icon: Server,
    title: "Secure Infrastructure",
    description:
      "ZERRA runs on serverless infrastructure with automatic scaling and isolation. Our PostgreSQL database (Neon) provides automatic backups, point-in-time recovery, and environment-level separation.",
  },
  {
    icon: Eye,
    title: "Video Content Protection",
    description:
      "Course videos are securely streamed through Mux with adaptive bitrate delivery. Videos cannot be easily downloaded — they are protected by signed playback tokens and DRM safeguards.",
  },
  {
    icon: FileCheck,
    title: "Secure File Handling",
    description:
      "File uploads (course attachments, images) are handled through UploadThing with server-side validation, type checking, and size limits. No direct file system access is exposed to end users.",
  },
];

export default function SecurityPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-block bg-brand/10 text-brand text-sm font-semibold px-4 py-2 rounded-full mb-6">
          Security
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary-text mb-6">
          Your Data, <span className="text-brand">Protected</span>
        </h1>
        <p className="text-lg text-secondary-text max-w-3xl mx-auto">
          Security is not an afterthought at NSKAI. ZERRA is built from the
          ground up with enterprise-grade security measures to ensure your
          data, content, and transactions are always safe.
        </p>
      </div>

      {/* Security Measures Grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-20">
        {SECURITY_MEASURES.map((measure) => (
          <div
            key={measure.title}
            className="bg-surface border border-border rounded-2xl p-6"
          >
            <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-4">
              <measure.icon className="w-6 h-6 text-brand" />
            </div>
            <h3 className="text-lg font-bold text-primary-text mb-2">
              {measure.title}
            </h3>
            <p className="text-secondary-text text-sm leading-relaxed">
              {measure.description}
            </p>
          </div>
        ))}
      </div>

      {/* Compliance */}
      <div className="bg-surface border border-border rounded-2xl p-8 mb-20">
        <h2 className="text-2xl font-bold text-primary-text mb-6">
          Compliance &amp; Best Practices
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-primary-text mb-2">
              Data Protection
            </h3>
            <p className="text-secondary-text text-sm leading-relaxed">
              We follow data protection best practices aligned with GDPR and
              CCPA requirements. Users can request access to, correction of, or
              deletion of their personal data at any time.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-primary-text mb-2">
              Payment Security
            </h3>
            <p className="text-secondary-text text-sm leading-relaxed">
              Payment processing is handled entirely by our PCI DSS-compliant
              payment provider. ZERRA never stores full credit card numbers or
              sensitive financial data on our servers.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-primary-text mb-2">
              Incident Response
            </h3>
            <p className="text-secondary-text text-sm leading-relaxed">
              We have an incident response plan in place. In the unlikely event
              of a security incident, affected users will be notified promptly
              and appropriate remediation steps will be taken.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-primary-text mb-2">
              Responsible Disclosure
            </h3>
            <p className="text-secondary-text text-sm leading-relaxed">
              If you discover a security vulnerability in ZERRA, please report
              it responsibly to{" "}
              <a
                href="mailto:contact@nskai.org"
                className="text-brand hover:underline"
              >
                contact@nskai.org
              </a>
              . We take all reports seriously and will respond promptly.
            </p>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary-text mb-4">
          Trusted Technology Partners
        </h2>
        <p className="text-secondary-text max-w-2xl mx-auto mb-8">
          ZERRA is built on industry-leading services that power some of the
          world&apos;s largest applications.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: "Clerk", desc: "Authentication" },
            { name: "Neon", desc: "Database" },
            { name: "Mux", desc: "Video Streaming" },
            { name: "Vercel", desc: "Hosting" },
          ].map((partner) => (
            <div
              key={partner.name}
              className="bg-surface border border-border rounded-xl p-4 text-center"
            >
              <div className="font-bold text-primary-text">{partner.name}</div>
              <div className="text-xs text-secondary-text">{partner.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
