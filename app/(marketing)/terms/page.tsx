import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Rules and guidelines for using the NSK.AI platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto prose dark:prose-invert">
      <h1>Terms of Service</h1>
      <p className="text-sm text-secondary-text">Last updated: October 2024</p>

      <p className="lead">
        Please read these Terms of Service carefully before using the NSK.AI
        platform.
      </p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using our service, you agree to be bound by these terms.
        If you disagree with any part of the terms, you may not access the
        service.
      </p>

      <h2>2. User Accounts</h2>
      <p>
        When you create an account with us, you must provide us information that
        is accurate, complete, and current at all times.
      </p>

      <h2>3. Intellectual Property</h2>
      <p>
        The service and its original content, features, and functionality are
        and will remain the exclusive property of NSK.AI and its licensors.
      </p>
    </div>
  );
}
