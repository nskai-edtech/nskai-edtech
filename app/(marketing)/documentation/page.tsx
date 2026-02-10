import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Comprehensive guides and API reference for NSK.AI.",
};

export default function DocumentationPage() {
  return (
    <div className="max-w-4xl mx-auto prose dark:prose-invert">
      <h1>Documentation</h1>
      <p className="lead">
        Everything you need to integrate and use NSK.AI effectively.
      </p>

      <h2>Getting Started</h2>
      <p>
        Learn the basics of setting up your account, creating your first course,
        and inviting students.
        <a href="#">Read the Quickstart Guide &rarr;</a>
      </p>

      <h2>For Developers</h2>
      <p>
        Integrate our AI capabilities into your own applications using our
        robust API.
        <a href="/api-reference">View API Reference &rarr;</a>
      </p>

      <h2>For Educators</h2>
      <p>
        Best practices for creating engaging AI-powered course content.
        <a href="#">Educator Guide &rarr;</a>
      </p>
    </div>
  );
}
