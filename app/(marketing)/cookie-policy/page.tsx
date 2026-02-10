import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Information about how we use cookies.",
};

export default function CookiePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto prose dark:prose-invert">
      <h1>Cookie Policy</h1>
      <p className="lead">
        This policy explains what cookies are and how we use them on our
        website.
      </p>

      <h2>What are cookies?</h2>
      <p>
        Cookies are small text files that are stored on your computer or mobile
        device when you visit a website.
      </p>

      <h2>How we use cookies</h2>
      <ul>
        <li>
          <strong>Essential cookies:</strong> Necessary for the website to
          function properly.
        </li>
        <li>
          <strong>Analytics cookies:</strong> Help us understand how visitors
          interact with the website.
        </li>
        <li>
          <strong>Preference cookies:</strong> Allow the website to remember
          your choices.
        </li>
      </ul>
    </div>
  );
}
