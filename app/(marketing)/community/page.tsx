import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community",
  description: "Connect with other educators and learners in the NSK.AI community.",
};

export default function CommunityPage() {
  return (
    <div className="max-w-4xl mx-auto prose dark:prose-invert">
      <h1>Community Forum</h1>
      <p className="lead">
        Join the conversation with thousands of educators and AI enthusiasts.
      </p>
      
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg not-prose flex items-start gap-4">
        <span className="text-2xl">🚧</span>
        <div>
          <h3 className="font-bold text-amber-800 dark:text-amber-200 text-sm">Under Construction</h3>
          <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
            Our new community platform is launching soon! In the meantime, join our Discord server.
          </p>
        </div>
      </div>

      <h2>Upcoming Events</h2>
      <ul>
        <li><strong>Oct 15:</strong> AI in Education Webinar</li>
        <li><strong>Nov 01:</strong> Global Hackathon</li>
      </ul>
    </div>
  );
}
