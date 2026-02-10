import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility",
  description: "Our commitment to making education accessible to everyone.",
};

export default function AccessibilityPage() {
  return (
    <div className="max-w-4xl mx-auto prose dark:prose-invert">
      <h1>Accessibility Statement</h1>
      <p className="lead">
        NSK AI is committed to ensuring digital accessibility for people with
        disabilities. We are continually improving the user experience for
        everyone and applying the relevant accessibility standards.
      </p>

      <h2>Conformance Status</h2>
      <p>
        The Web Content Accessibility Guidelines (WCAG) defines requirements for
        designers and developers to improve accessibility for people with
        disabilities. It defines three levels of conformance: Level A, Level AA,
        and Level AAA. NSK AI is partially conformant with WCAG 2.1 level AA.
      </p>

      <h2>Feedback</h2>
      <p>
        We welcome your feedback on the accessibility of NSK AI. Please let us
        know if you encounter accessibility barriers on NSK AI:
      </p>
      <ul>
        <li>
          E-mail:{" "}
          <a href="mailto:accessibility@nskai.org">accessibility@nskai.org</a>
        </li>
      </ul>
    </div>
  );
}
