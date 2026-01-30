export default function LearnerDashboard() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Learning</h1>
      </div>

      <div className="p-6 bg-surface rounded-lg border shadow-sm dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          You are not enrolled in any courses.
        </p>
        {/* Course list will be added later */}
      </div>
    </>
  );
}
