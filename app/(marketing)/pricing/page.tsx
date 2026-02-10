import { Metadata } from "next";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing Plans",
  description: "Flexible plans for learners, tutors, and institutions.",
};

export default function PricingPage() {
  return (
    <div className="max-w-6xl mx-auto py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4 text-primary-text">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-secondary-text">
          Choose the plan that fits your learning journey.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Basic Plan */}
        <div className="border border-border rounded-2xl p-8 bg-surface">
          <h3 className="text-lg font-semibold mb-2 text-primary-text">
            Learner
          </h3>
          <div className="text-3xl font-bold mb-6 text-primary-text">Free</div>
          <ul className="space-y-4 mb-8">
            {[
              "Access to free courses",
              "Basic AI assistance",
              "Community support",
            ].map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-secondary-text"
              >
                <Check className="w-5 h-5 text-brand" />
                {feature}
              </li>
            ))}
          </ul>
          <button className="w-full py-2 px-4 rounded-lg border border-brand text-brand font-medium hover:bg-brand/5 transition-colors">
            Get Started
          </button>
        </div>

        {/* Pro Plan */}
        <div className="border-2 border-brand rounded-2xl p-8 bg-surface relative">
          <div className="absolute top-0 right-0 bg-brand text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
            POPULAR
          </div>
          <h3 className="text-lg font-semibold mb-2 text-primary-text">Pro</h3>
          <div className="text-3xl font-bold mb-6 text-primary-text">
            $19
            <span className="text-lg font-normal text-secondary-text">/mo</span>
          </div>
          <ul className="space-y-4 mb-8">
            {[
              "Unlimited course access",
              "Advanced AI Tutor",
              "Certificate of completion",
              "Priority support",
            ].map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-primary-text"
              >
                <Check className="w-5 h-5 text-brand" />
                {feature}
              </li>
            ))}
          </ul>
          <button className="w-full py-2 px-4 rounded-lg bg-brand text-white font-medium hover:bg-brand/90 transition-colors">
            Start Free Trial
          </button>
        </div>

        {/* Team Plan */}
        <div className="border border-border rounded-2xl p-8 bg-surface">
          <h3 className="text-lg font-semibold mb-2 text-primary-text">
            Institution
          </h3>
          <div className="text-3xl font-bold mb-6 text-primary-text">
            Custom
          </div>
          <ul className="space-y-4 mb-8">
            {[
              "SSO & Admin controls",
              "LMS Integration",
              "Custom AI models",
              "Dedicated success manager",
            ].map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-secondary-text"
              >
                <Check className="w-5 h-5 text-brand" />
                {feature}
              </li>
            ))}
          </ul>
          <button className="w-full py-2 px-4 rounded-lg border border-border text-primary-text font-medium hover:bg-surface-muted transition-colors">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
}
