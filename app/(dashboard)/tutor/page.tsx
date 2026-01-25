import { UserButton } from "@clerk/nextjs";

export default function TutorDashboard() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tutor Dashboard</h1>
        <UserButton />
      </div>
      <div className="p-6 bg-white rounded-lg border shadow-sm">
        <h2 className="text-xl font-semibold mb-2">My Courses</h2>
        <p className="text-gray-500">
          You haven&apos;t created any courses yet.
        </p>
        {/* We will add the "Create Course" button here later */}
      </div>
    </div>
  );
}
