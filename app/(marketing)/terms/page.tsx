import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | ZERRA by NSKAI",
  description:
    "Terms of Service governing the use of the ZERRA learning platform by NSKAI.",
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto prose dark:prose-invert">
      <h1>Terms of Service</h1>
      <p className="text-sm text-secondary-text">Last updated: February 2026</p>

      <p className="lead">
        These Terms of Service (&quot;Terms&quot;) govern your access to and use
        of the ZERRA platform operated by NSKAI (&quot;we&quot;, &quot;us&quot;,
        or &quot;our&quot;). By accessing or using ZERRA, you agree to be bound
        by these Terms.
      </p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By creating an account or accessing the ZERRA platform at any capacity —
        whether as a Learner, Tutor, or Organization Administrator — you confirm
        that you have read, understood, and agree to these Terms. If you do not
        agree, you must not use the platform.
      </p>

      <h2>2. Description of Service</h2>
      <p>ZERRA is an AI-powered learning management system that enables:</p>
      <ul>
        <li>
          <strong>Learners</strong> to browse, purchase, and consume video-based
          courses, interact with AI tutors, complete quizzes, track progress,
          and earn certificates.
        </li>
        <li>
          <strong>Tutors</strong> to create, publish, and manage courses
          consisting of chapters, video lessons, quizzes, and supplementary
          materials.
        </li>
        <li>
          <strong>Organizations</strong> to manage tutors, learners, course
          approvals, billing, and analytics under a multi-tenant structure.
        </li>
      </ul>

      <h2>3. User Accounts</h2>
      <p>
        To access ZERRA, you must create an account through our authentication
        provider. You are responsible for maintaining the confidentiality of
        your login credentials and for all activities that occur under your
        account. You must provide accurate and complete information during
        registration and keep it up to date.
      </p>

      <h2>4. User Roles and Responsibilities</h2>
      <h3>4.1 Learners</h3>
      <p>
        Learners agree to use the platform for legitimate educational purposes.
        You may not share account credentials, redistribute course content, or
        attempt to download protected video material.
      </p>
      <h3>4.2 Tutors</h3>
      <p>
        Tutors represent that they have the right to publish all content they
        upload. Course content must not infringe on any third-party intellectual
        property rights. Tutors are responsible for the accuracy of their
        educational material.
      </p>
      <h3>4.3 Organizations</h3>
      <p>
        Organization administrators are responsible for managing their team
        members, ensuring appropriate use of the platform, and maintaining
        billing information.
      </p>

      <h2>5. Course Purchases and Payments</h2>
      <p>
        Some courses on ZERRA require payment. By purchasing a course, you agree
        to pay the listed price at the time of purchase. Payments are processed
        through our secure third-party payment processor. All sales are subject
        to our refund policy, which may be updated from time to time.
      </p>

      <h2>6. Intellectual Property</h2>
      <p>
        The ZERRA platform, including its design, code, AI models, branding, and
        documentation, is the exclusive property of NSKAI. Course content is
        owned by the respective Tutors or Organizations that created it.
        Learners receive a limited, non-transferable license to access purchased
        course content for personal educational use only.
      </p>

      <h2>7. AI Features Disclaimer</h2>
      <p>
        ZERRA provides AI-powered tutoring features designed to assist with
        learning. While we strive for accuracy, AI-generated responses are
        supplementary and should not be treated as a substitute for professional
        advice, official certifications, or medical, legal, or financial
        guidance. NSKAI is not liable for decisions made based on AI outputs.
      </p>

      <h2>8. Prohibited Conduct</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the platform for any unlawful purpose.</li>
        <li>
          Attempt to reverse-engineer, hack, or disrupt the platform or its
          infrastructure.
        </li>
        <li>
          Upload malicious content, spam, or material that violates others&apos;
          rights.
        </li>
        <li>
          Share your account with others or create multiple accounts to
          circumvent platform rules.
        </li>
        <li>Scrape, download, or redistribute course video content.</li>
      </ul>

      <h2>9. Termination</h2>
      <p>
        We reserve the right to suspend or terminate your account at any time
        for violation of these Terms, fraudulent activity, or at our sole
        discretion. You may also delete your account at any time through your
        account settings.
      </p>

      <h2>10. Limitation of Liability</h2>
      <p>
        ZERRA is provided &quot;as is&quot; and &quot;as available.&quot; To the
        maximum extent permitted by law, NSKAI shall not be liable for any
        indirect, incidental, special, consequential, or punitive damages,
        including loss of profits, data, or other intangible losses arising from
        your use of the platform.
      </p>

      <h2>11. Modifications to Terms</h2>
      <p>
        We may update these Terms from time to time. When we do, we will revise
        the &quot;Last updated&quot; date above. Continued use of ZERRA after
        changes constitutes acceptance of the updated Terms.
      </p>

      <h2>12. Governing Law</h2>
      <p>
        These Terms shall be governed by and construed in accordance with
        applicable laws. Any disputes shall be resolved through good-faith
        negotiation or, failing that, through binding arbitration.
      </p>

      <h2>13. Contact</h2>
      <p>
        If you have questions about these Terms, please contact us at{" "}
        <a href="mailto:contact@nskai.org">contact@nskai.org</a>.
      </p>
    </div>
  );
}
