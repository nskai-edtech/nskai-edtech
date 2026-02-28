import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | ZERRA by NSKAI",
  description:
    "How NSKAI collects, uses, stores, and protects your personal data on the ZERRA platform.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto prose dark:prose-invert">
      <h1>Privacy Policy</h1>
      <p className="text-sm text-secondary-text">
        Last updated: February 2026
      </p>

      <p className="lead">
        At NSKAI, your privacy is fundamental to our mission. This Privacy
        Policy explains how we collect, use, store, and protect your personal
        information when you use the ZERRA platform.
      </p>

      <h2>1. Information We Collect</h2>

      <h3>1.1 Information You Provide</h3>
      <ul>
        <li>
          <strong>Account Data:</strong> Name, email address, and profile
          information provided during registration through our authentication
          provider (Clerk).
        </li>
        <li>
          <strong>Course Content:</strong> Materials uploaded by Tutors
          including videos, documents, quizzes, and descriptions.
        </li>
        <li>
          <strong>Communications:</strong> Messages sent through our contact
          form, support channels, or AI tutor conversations.
        </li>
        <li>
          <strong>Payment Information:</strong> Billing details processed
          through our secure third-party payment processor. We do not store
          full credit card numbers on our servers.
        </li>
      </ul>

      <h3>1.2 Information Collected Automatically</h3>
      <ul>
        <li>
          <strong>Usage Data:</strong> Course enrollment, lesson progress,
          quiz results, XP earned, and certificates obtained.
        </li>
        <li>
          <strong>Device Information:</strong> Browser type, operating system,
          and device identifiers used to optimize your experience.
        </li>
        <li>
          <strong>Cookies &amp; Analytics:</strong> We use essential cookies
          for authentication and optional analytics cookies to understand
          platform usage. See our{" "}
          <a href="/cookie-policy">Cookie Policy</a> for details.
        </li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>We use collected data to:</p>
      <ul>
        <li>Provide and maintain the ZERRA platform and its features.</li>
        <li>
          Deliver personalized AI tutoring based on lesson context and your
          learning history.
        </li>
        <li>Track your course progress, quizzes, and certifications.</li>
        <li>Process payments and manage subscriptions.</li>
        <li>
          Send important updates about your account, enrolled courses, and
          platform changes.
        </li>
        <li>
          Improve the platform through anonymized analytics and usage patterns.
        </li>
        <li>Prevent fraud, abuse, and unauthorized access.</li>
      </ul>

      <h2>3. AI Tutor Data Handling</h2>
      <p>
        When you interact with ZERRA&apos;s AI tutors, your questions and the
        related lesson context are sent to our AI provider to generate
        responses. We do not use your individual conversations to train
        external AI models. Conversations may be retained temporarily for
        your learning continuity and are handled in accordance with this
        policy.
      </p>

      <h2>4. Data Sharing</h2>
      <p>We do not sell your personal data. We share data only with:</p>
      <ul>
        <li>
          <strong>Service Providers:</strong> Trusted third-party services
          that help us operate ZERRA, including authentication (Clerk), video
          delivery (Mux), file storage (UploadThing), payment processing,
          and email delivery (Resend). These providers are contractually
          obligated to protect your data.
        </li>
        <li>
          <strong>Organization Admins:</strong> If you are part of an
          organization on ZERRA, your admin may see enrollment data, progress,
          and analytics relevant to their institution.
        </li>
        <li>
          <strong>Legal Requirements:</strong> We may disclose data if
          required by law or to protect the rights and safety of NSKAI, our
          users, or the public.
        </li>
      </ul>

      <h2>5. Data Security</h2>
      <p>
        We implement industry-standard security measures to protect your data:
      </p>
      <ul>
        <li>Data encrypted in transit (TLS 1.3) and at rest (AES-256).</li>
        <li>
          Authentication managed by Clerk with support for multi-factor
          authentication and secure session management.
        </li>
        <li>
          Server-side role-based access control ensuring users can only
          access data appropriate to their role.
        </li>
        <li>
          Serverless PostgreSQL database (Neon) with automatic backups and
          environment-level isolation.
        </li>
      </ul>

      <h2>6. Data Retention</h2>
      <p>
        We retain your personal data for as long as your account is active or
        as needed to provide services. If you delete your account, we will
        remove your personal data within 30 days, except where retention is
        required by law or for legitimate business purposes (such as fraud
        prevention).
      </p>

      <h2>7. Your Rights</h2>
      <p>Depending on your jurisdiction, you may have the right to:</p>
      <ul>
        <li>Access and receive a copy of your personal data.</li>
        <li>Correct inaccurate personal data.</li>
        <li>Request deletion of your personal data.</li>
        <li>Object to or restrict certain processing.</li>
        <li>Data portability — receiving your data in a portable format.</li>
      </ul>
      <p>
        To exercise any of these rights, contact us at{" "}
        <a href="mailto:contact@nskai.org">contact@nskai.org</a>.
      </p>

      <h2>8. Children&apos;s Privacy</h2>
      <p>
        ZERRA is not directed at children under 13. We do not knowingly
        collect personal information from children under 13. If we learn that
        we have collected data from a child under 13, we will take steps to
        delete it promptly.
      </p>

      <h2>9. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Material changes
        will be communicated via email or a notice on the platform. Continued
        use of ZERRA after changes constitutes acceptance of the revised
        policy.
      </p>

      <h2>10. Contact Us</h2>
      <p>
        If you have questions or concerns about this Privacy Policy or your
        data, please contact us at{" "}
        <a href="mailto:contact@nskai.org">contact@nskai.org</a>.
      </p>
    </div>
  );
}
