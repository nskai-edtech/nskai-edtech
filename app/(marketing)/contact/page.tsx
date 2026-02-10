import { Metadata } from "next";
import { Mail, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the NSK.AI team for support, sales, or general inquiries.",
};

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 py-12">
      <div>
        <h1 className="text-4xl font-bold text-primary-text mb-6">
          Get in touch
        </h1>
        <p className="text-lg text-secondary-text mb-8">
          Have questions about our platform? We&apos;re here to help. Fill out
          the form or reach out directly.
        </p>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h3 className="font-semibold text-primary-text mb-1">
                Email Support
              </h3>
              <p className="text-secondary-text mb-2">
                For general inquiries and technical support.
              </p>
              <a
                href="mailto:Contact@nskai.org"
                className="text-brand font-medium hover:underline"
              >
                Contact@nskai.org
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h3 className="font-semibold text-primary-text mb-1">Office</h3>
              <p className="text-secondary-text">
                123 Innovation Drive
                <br />
                Tech City, TC 90210
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-8">
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
                className="w-full px-4 py-2 rounded-lg border border-border bg-surface text-primary-text focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
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
                className="w-full px-4 py-2 rounded-lg border border-border bg-surface text-primary-text focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-primary-text"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 rounded-lg border border-border bg-surface text-primary-text focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
            />
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
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-border bg-surface text-primary-text focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all resize-none"
            ></textarea>
          </div>

          <button
            type="button"
            className="w-full bg-brand text-white font-medium py-2.5 rounded-lg hover:bg-brand/90 transition-colors"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
