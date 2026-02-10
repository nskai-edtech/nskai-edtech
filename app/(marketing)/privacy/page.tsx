import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How we collect, use, and protect your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto prose dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p className="text-sm text-secondary-text">Last updated: October 2024</p>

      <p className="lead">
        At NSK.AI, we take your privacy seriously. This policy describes how we
        handle your personal information.
      </p>

      <h2>1. Information We Collect</h2>
      <p>
        We collect information you provide directly to us, such as when you
        create an account, subscribe to our newsletter, or contact support.
      </p>

      <h2>2. How We Use Your Information</h2>
      <p>
        We use the information we collect to operate, maintain, and improve our
        services, including providing personalized AI tutoring.
      </p>

      <h2>3. Data Security</h2>
      <p>
        We implement appropriate technical and organizational measures to
        protect your personal data against unauthorized access or disclosure.
      </p>
    </div>
  );
}
