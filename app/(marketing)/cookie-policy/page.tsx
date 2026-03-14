import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | ZERRA by NSKAI",
  description:
    "Understand how ZERRA uses cookies and similar technologies to improve your experience.",
};

export default function CookiePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto prose dark:prose-invert">
      <h1>Cookie Policy</h1>
      <p className="text-sm text-secondary-text">Last updated: February 2026</p>

      <p className="lead">
        This Cookie Policy explains what cookies are, how NSKAI uses them on the
        ZERRA platform, and what choices you have regarding their use.
      </p>

      <h2>What Are Cookies?</h2>
      <p>
        Cookies are small text files stored on your device (computer, tablet, or
        mobile) when you visit a website. They help websites remember your
        preferences, keep you signed in, and understand how you interact with
        the platform.
      </p>

      <h2>Types of Cookies We Use</h2>

      <h3>Essential Cookies (Required)</h3>
      <p>
        These cookies are necessary for ZERRA to function properly. They enable
        core features such as:
      </p>
      <ul>
        <li>User authentication and session management via Clerk.</li>
        <li>Remembering your role (Learner, Tutor, or Admin) across pages.</li>
        <li>Maintaining security and preventing unauthorized access.</li>
        <li>Remembering your theme preference (light/dark mode).</li>
      </ul>
      <p>
        <strong>These cookies cannot be disabled</strong> as they are essential
        to the platform&apos;s operation.
      </p>

      <h3>Analytics Cookies (Optional)</h3>
      <p>
        These cookies help us understand how visitors interact with ZERRA so we
        can improve the platform. They collect anonymized data such as:
      </p>
      <ul>
        <li>Pages visited and time spent on each page.</li>
        <li>Navigation patterns and feature usage.</li>
        <li>Error occurrences and performance metrics.</li>
      </ul>
      <p>
        We use Sentry for error tracking and performance monitoring. These
        cookies do not collect personally identifiable information.
      </p>

      <h3>Preference Cookies (Optional)</h3>
      <p>
        These cookies allow the platform to remember choices you make, such as:
      </p>
      <ul>
        <li>Display preferences and UI settings.</li>
        <li>
          Last-visited course or lesson for the continue-learning feature.
        </li>
        <li>Language and regional preferences.</li>
      </ul>

      <h2>Third-Party Cookies</h2>
      <p>
        Some cookies are set by third-party services we use to operate ZERRA:
      </p>
      <ul>
        <li>
          <strong>Clerk:</strong> Authentication and session management cookies.
        </li>
        <li>
          <strong>Mux:</strong> Video player cookies for adaptive streaming and
          playback quality.
        </li>
        <li>
          <strong>Sentry:</strong> Error tracking and performance monitoring
          cookies.
        </li>
      </ul>
      <p>
        These third-party services have their own privacy and cookie policies,
        which we encourage you to review.
      </p>

      <h2>Managing Cookies</h2>
      <p>
        You can control and manage cookies through your browser settings. Most
        browsers allow you to:
      </p>
      <ul>
        <li>View what cookies are stored and delete them individually.</li>
        <li>Block third-party cookies.</li>
        <li>Block cookies from specific sites.</li>
        <li>Block all cookies.</li>
        <li>Delete all cookies when you close your browser.</li>
      </ul>
      <p>
        Please note that disabling essential cookies may prevent you from using
        ZERRA properly, including staying signed in and accessing your courses.
      </p>

      <h2>Updates to This Policy</h2>
      <p>
        We may update this Cookie Policy from time to time to reflect changes in
        our practices or for legal reasons. Changes will be posted on this page
        with an updated revision date.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have questions about our use of cookies, please contact us at{" "}
        <a href="mailto:contact@nskai.org">contact@nskai.org</a>.
      </p>
    </div>
  );
}
