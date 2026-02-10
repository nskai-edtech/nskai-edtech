import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about the mission and team behind NSK AI.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto prose dark:prose-invert">
      <h1>About NSK AI</h1>
      <p className="lead">
        We are on a mission to democratize quality education through artificial
        intelligence.
      </p>

      <h2>Our Story</h2>
      <p>
        Founded in 2024, NSK AI was born from a simple idea: what if every
        student could have a personal tutor? Since then, we have grown into a
        global platform serving thousands of learners.
      </p>

      <h2>Our Mission</h2>
      <p>
        To provide accessible, personalized, and effective learning experiences
        to anyone, anywhere in the world.
      </p>

      <h2>Our Values</h2>
      <ul>
        <li>
          <strong>Innovation:</strong> Constantly pushing the boundaries of what
          is possible in EdTech.
        </li>
        <li>
          <strong>Accessibility:</strong> Making learning available to everyone.
        </li>
        <li>
          <strong>User-Centric:</strong> Putting students and educators first.
        </li>
      </ul>
    </div>
  );
}
