import { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Security",
  description: "Our commitment to data protection and platform security.",
};

export default function SecurityPage() {
  return (
    <div className="max-w-4xl mx-auto prose dark:prose-invert">
      <h1>Security at NSK.AI</h1>
      <p className="lead">
        Protecting your data is our top priority. We use enterprise-grade
        security measures to keep your information safe.
      </p>

      <div className="grid sm:grid-cols-2 gap-6 not-prose my-12">
        <div className="p-6 bg-surface border border-border rounded-xl">
          <ShieldCheck className="w-8 h-8 text-brand mb-4" />
          <h3 className="font-bold text-lg mb-2 text-primary-text">
            Data Encryption
          </h3>
          <p className="text-secondary-text">
            All data is encrypted in transit using TLS 1.3 and at rest using
            AES-256.
          </p>
        </div>
        <div className="p-6 bg-surface border border-border rounded-xl">
          <ShieldCheck className="w-8 h-8 text-brand mb-4" />
          <h3 className="font-bold text-lg mb-2 text-primary-text">
            Regular Audits
          </h3>
          <p className="text-secondary-text">
            We conduct regular third-party security audits and penetration
            testing.
          </p>
        </div>
      </div>

      <h2>Compliance</h2>
      <p>
        We comply with major data protection regulations including GDPR and
        CCPA.
      </p>
    </div>
  );
}
