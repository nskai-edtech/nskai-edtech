export default function EnrolledCourses() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Enrolled Courses</h1>
        <p className="text-secondary-text mt-2">
          Continue learning from where you left off
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Enrolled course cards will be added here */}
        <div className="p-6 bg-surface rounded-lg border shadow-sm dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            You are not enrolled in any courses yet.
          </p>
        </div>
      </div>
    </>
  );
}
