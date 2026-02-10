import { Metadata } from "next";
import { Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Find answers to common questions and troubleshoot issues.",
};

export default function HelpCenterPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-primary-text">
          How can we help?
        </h1>
        <div className="max-w-xl mx-auto relative">
          <input
            type="text"
            placeholder="Search tailored help articles..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-surface shadow-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
          />
          <Search className="absolute left-4 top-3.5 text-secondary-text w-5 h-5" />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            title: "Account & Billing",
            icon: "💳",
            items: ["Managing subscription", "Payment methods", "Invoices"],
          },
          {
            title: "Using the Platform",
            icon: "🎓",
            items: [
              "Creating courses",
              "Student analytics",
              "AI Tutor settings",
            ],
          },
          {
            title: "Troubleshooting",
            icon: "🔧",
            items: ["Login issues", "Video playback", "Browser compatibility"],
          },
        ].map((category) => (
          <div
            key={category.title}
            className="p-6 bg-surface border border-border rounded-xl"
          >
            <div className="text-3xl mb-4">{category.icon}</div>
            <h3 className="font-bold text-lg mb-4 text-primary-text">
              {category.title}
            </h3>
            <ul className="space-y-2">
              {category.items.map((item) => (
                <li key={item}>
                  <a href="#" className="text-brand hover:underline text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="text-center mt-12 bg-surface-muted p-8 rounded-xl">
        <h3 className="font-bold text-lg mb-2 text-primary-text">
          Still need help?
        </h3>
        <p className="text-secondary-text mb-4">
          Our support team is available 24/7.
        </p>
        <a
          href="/contact"
          className="inline-block bg-brand text-white px-6 py-2 rounded-lg font-medium hover:bg-brand/90 transition-colors"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}
