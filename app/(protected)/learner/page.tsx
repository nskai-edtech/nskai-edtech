import { UserButton } from "@clerk/nextjs";

export default function LearnerDashboard() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Learning</h1>
        <UserButton />
      </div>
      <div className="p-6 bg-surface rounded-lg border shadow-sm dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          You are not enrolled in any courses.
        </p>
        {/* We will add the Course List here later */}
      </div>
    </div>
  );
}
