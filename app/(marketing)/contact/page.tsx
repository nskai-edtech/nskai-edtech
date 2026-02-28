import { Metadata } from "next";
import { Mail, Clock, MessageSquare } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us | ZERRA by NSKAI",
  description:
    "Get in touch with the NSKAI team for support, sales inquiries, partnerships, or general questions about the ZERRA platform.",
};

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-block bg-brand/10 text-brand text-sm font-semibold px-4 py-2 rounded-full mb-6">
          Contact Us
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary-text mb-4">
          Get in Touch
        </h1>
        <p className="text-lg text-secondary-text max-w-2xl mx-auto">
          Have questions about ZERRA? Whether you&apos;re a learner, tutor, or
          institution — we&apos;re here to help.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div>
          <h2 className="text-2xl font-bold text-primary-text mb-6">
            Reach Out Directly
          </h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-brand" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-text mb-1">
                  General Inquiries
                </h3>
                <p className="text-secondary-text text-sm mb-2">
                  For questions about ZERRA, partnerships, or anything else.
                </p>
                <a
                  href="mailto:contact@nskai.org"
                  className="text-brand font-medium hover:underline"
                >
                  contact@nskai.org
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 text-brand" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-text mb-1">
                  Sales &amp; Institutions
                </h3>
                <p className="text-secondary-text text-sm mb-2">
                  Interested in ZERRA for your school or organization? Let&apos;s
                  talk.
                </p>
                <a
                  href="mailto:contact@nskai.org"
                  className="text-brand font-medium hover:underline"
                >
                  contact@nskai.org
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-brand" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-text mb-1">
                  Response Time
                </h3>
                <p className="text-secondary-text text-sm">
                  We typically respond within 24–48 hours on business days.
                  For urgent matters, please indicate so in the subject line.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8 p-6 bg-surface-muted rounded-xl">
            <h3 className="font-semibold text-primary-text mb-3">
              Before reaching out, try these resources:
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/help"
                  className="text-brand hover:underline"
                >
                  Help Center — Common questions and guides
                </Link>
              </li>
              <li>
                <Link
                  href="/documentation"
                  className="text-brand hover:underline"
                >
                  Documentation — Platform setup and usage
                </Link>
              </li>
              <li>
                <Link
                  href="/community"
                  className="text-brand hover:underline"
                >
                  Community — Connect with other ZERRA users
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-surface border border-border rounded-2xl p-8">
          <h2 className="text-xl font-bold text-primary-text mb-6">
            Send Us a Message
          </h2>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="firstName"
                  className="text-sm font-medium text-primary-text"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  placeholder="Jane"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-primary-text focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="lastName"
                  className="text-sm font-medium text-primary-text"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  placeholder="Doe"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-primary-text focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-primary-text"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="jane@example.com"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-primary-text focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="subject"
                className="text-sm font-medium text-primary-text"
              >
                Subject
              </label>
              <select
                id="subject"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-primary-text focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
              >
                <option value="">Select a topic...</option>
                <option value="general">General Inquiry</option>
                <option value="support">Technical Support</option>
                <option value="sales">Sales &amp; Institutions</option>
                <option value="partnership">Partnership Opportunity</option>
                <option value="feedback">Feedback &amp; Suggestions</option>
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="message"
                className="text-sm font-medium text-primary-text"
              >
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                placeholder="Tell us how we can help..."
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-primary-text focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all resize-none"
              ></textarea>
            </div>

            <button
              type="button"
              className="w-full bg-brand text-white font-medium py-3 rounded-lg hover:bg-brand/90 transition-colors"
            >
              Send Message
            </button>
            <p className="text-xs text-secondary-text text-center">
              By submitting this form, you agree to our{" "}
              <Link href="/privacy" className="text-brand hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
