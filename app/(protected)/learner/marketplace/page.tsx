export default function CourseMarketplace() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Course Marketplace</h1>
        <p className="text-secondary-text mt-2">
          Browse our collection of courses across different categories
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Course cards will be added here */}
        <div className="p-6 bg-surface rounded-lg border shadow-sm dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            Courses will be listed here...
          </p>
        </div>
      </div>
    </>
  );
}
