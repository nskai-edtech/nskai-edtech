import { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Reference",
  description: "Technical documentation for the NSK AI REST API.",
};

export default function ApiReferencePage() {
  return (
    <div className="max-w-5xl mx-auto flex gap-12">
      <div className="hidden md:block w-64 shrink-0">
        <div className="sticky top-24 space-y-1">
          <h4 className="font-bold text-sm uppercase text-secondary-text mb-2 px-3">
            Overview
          </h4>
          <a
            href="#"
            className="block px-3 py-1.5 text-sm font-medium text-brand bg-brand/5 rounded-lg"
          >
            Introduction
          </a>
          <a
            href="#"
            className="block px-3 py-1.5 text-sm font-medium text-secondary-text hover:text-primary-text"
          >
            Authentication
          </a>
          <a
            href="#"
            className="block px-3 py-1.5 text-sm font-medium text-secondary-text hover:text-primary-text"
          >
            Errors
          </a>

          <h4 className="font-bold text-sm uppercase text-secondary-text mt-6 mb-2 px-3">
            Endpoints
          </h4>
          <a
            href="#"
            className="block px-3 py-1.5 text-sm font-medium text-secondary-text hover:text-primary-text"
          >
            Courses
          </a>
          <a
            href="#"
            className="block px-3 py-1.5 text-sm font-medium text-secondary-text hover:text-primary-text"
          >
            Students
          </a>
          <a
            href="#"
            className="block px-3 py-1.5 text-sm font-medium text-secondary-text hover:text-primary-text"
          >
            Analytics
          </a>
        </div>
      </div>

      <div className="flex-1 prose dark:prose-invert max-w-none">
        <h1>API Reference</h1>
        <p className="lead">
          Programmatically interact with the NSK AI platform to manage courses,
          students, and retrieve analytics.
        </p>

        <h2>Authentication</h2>
        <p>
          All API requests must be authenticated using a Bearer token in the
          header.
        </p>
        <pre>
          <code>Authorization: Bearer YOUR_API_KEY</code>
        </pre>

        <h2>Rate Limiting</h2>
        <p>
          The API is rate limited to 100 requests per minute per IP address.
        </p>
      </div>
    </div>
  );
}
