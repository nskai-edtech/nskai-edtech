import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner Program",
  description: "Collaborate with NSK.AI to expand your reach.",
};

export default function PartnerProgramPage() {
  return (
    <div className="max-w-4xl mx-auto prose dark:prose-invert">
      <h1>Partner with NSK.AI</h1>
      <p className="lead">Let&apos;s build the future of education together.</p>

      <h2>Why Partner with Us?</h2>
      <ul>
        <li>
          <strong>Revenue Share:</strong> Earn competitive commissions on
          referrals.
        </li>
        <li>
          <strong>Co-Marketing:</strong> Reach our global audience of learners.
        </li>
        <li>
          <strong>Early Access:</strong> Get first looks at new AI features.
        </li>
      </ul>

      <div className="not-prose mt-8">
        <a
          href="/contact"
          className="inline-block bg-brand text-white! no-underline! px-6 py-3 rounded-lg font-bold hover:bg-brand/90 transition-colors"
        >
          Apply to Partner Program
        </a>
      </div>
    </div>
  );
}
