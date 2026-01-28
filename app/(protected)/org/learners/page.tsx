import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Users,
  MoreHorizontal,
  Mail,
  Calendar,
  Zap,
} from "lucide-react";
import Image from "next/image";

// --- Mock Data Generation ---
const STATUSES = ["Active", "Inactive", "Completed", "On Hold"] as const;

interface Learner {
  id: string;
  name: string;
  email: string;
  progress: number;
  status: (typeof STATUSES)[number];
  joinedDate: string;
  avatar: string;
  course: string;
}

const generateLearners = (count: number): Learner[] => {
  const learners: Learner[] = [];
  const firstNames = [
    "James",
    "Mary",
    "Robert",
    "Patricia",
    "John",
    "Jennifer",
    "Michael",
    "Linda",
    "David",
    "Elizabeth",
    "William",
    "Barbara",
    "Richard",
    "Susan",
    "Joseph",
    "Jessica",
    "Thomas",
    "Sarah",
    "Charles",
    "Karen",
  ];
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Hernandez",
    "Lopez",
    "Gonzalez",
    "Wilson",
    "Anderson",
    "Thomas",
    "Taylor",
    "Moore",
    "Jackson",
    "Martin",
  ];
  const courses = [
    "Advanced Calculus",
    "Physics 101",
    "Intro to Psychology",
    "Web Development Bootcamp",
    "Data Science Fundamentals",
    "Creative Writing Masterclass",
  ];

  for (let i = 1; i <= count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    const progress = Math.floor(Math.random() * 101);

    learners.push({
      id: i.toString(),
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      progress,
      status,
      joinedDate: new Date(
        Date.now() - Math.floor(Math.random() * 10000000000),
      ).toLocaleDateString(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}${i}`,
      course: courses[Math.floor(Math.random() * courses.length)],
    });
  }
  return learners;
};

// Generate 300 learners once (simulated DB)
const ALL_LEARNERS = generateLearners(300);

export default async function LearnersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const pageSize = 20;

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const currentLearners = ALL_LEARNERS.slice(start, end);
  const totalPages = Math.ceil(ALL_LEARNERS.length / pageSize);

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary-text flex items-center gap-3">
              <Users className="w-8 h-8 text-brand" />
              Learners
            </h1>
            <p className="text-secondary-text mt-2">
              Manage and track the progress of all students in your
              organization.
            </p>
          </div>
          <div>
            <button className="px-5 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-xl font-medium transition-colors shadow-lg shadow-brand/20 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Export Data</span>
            </button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-start gap-3 w-full">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text" />
            <input
              type="text"
              placeholder="Search learners..."
              className="pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand w-full"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards (Optional Polish) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Learners", value: "300", color: "text-blue-600" },
          { label: "Active Now", value: "142", color: "text-green-600" },
          { label: "Avg. Progress", value: "68%", color: "text-purple-600" },
          { label: "Completion Rate", value: "94%", color: "text-orange-600" },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-surface p-4 rounded-xl border border-border flex flex-col"
          >
            <span className="text-sm text-secondary-text font-medium">
              {stat.label}
            </span>
            <span className={`text-2xl font-bold mt-1 ${stat.color}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Table Container */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-muted/50 border-b border-border text-xs uppercase tracking-wider text-secondary-text font-semibold">
                <th className="px-6 py-4">Learner</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Current Course</th>
                <th className="px-6 py-4 w-48">Progress</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {currentLearners.map((learner) => (
                <tr
                  key={learner.id}
                  className="group hover:bg-surface-muted/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-muted border border-border overflow-hidden shrink-0">
                        <Image
                          src={learner.avatar}
                          alt={learner.name}
                          width={40}
                          height={40}
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-primary-text text-sm">
                          {learner.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-secondary-text mt-0.5">
                          <Mail className="w-3 h-3" />
                          {learner.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                        ${
                          learner.status === "Active"
                            ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                            : learner.status === "Inactive"
                              ? "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                              : learner.status === "Completed"
                                ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                                : "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800"
                        }`}
                    >
                      {learner.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-primary-text font-medium">
                      {learner.course}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-semibold text-primary-text">
                          {learner.progress}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-surface-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            learner.progress >= 90
                              ? "bg-green-500"
                              : learner.progress >= 50
                                ? "bg-brand"
                                : "bg-orange-400"
                          }`}
                          style={{ width: `${learner.progress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-secondary-text">
                      <Calendar className="w-3.5 h-3.5" />
                      {learner.joinedDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 rounded-lg hover:bg-surface-muted text-secondary-text hover:text-primary-text transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="border-t border-border px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-surface-muted/10">
          <div className="text-sm text-secondary-text">
            Showing{" "}
            <span className="font-bold text-primary-text">{start + 1}</span> to{" "}
            <span className="font-bold text-primary-text">
              {Math.min(end, ALL_LEARNERS.length)}
            </span>{" "}
            of{" "}
            <span className="font-bold text-primary-text">
              {ALL_LEARNERS.length}
            </span>{" "}
            learners
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={page > 1 ? `/org/learners?page=${page - 1}` : "#"}
              className={`p-2 rounded-lg border border-border transition-colors ${
                page > 1
                  ? "bg-surface hover:bg-surface-muted text-primary-text"
                  : "bg-surface-muted text-secondary-text cursor-not-allowed opacity-50"
              }`}
              aria-disabled={page <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-1.5 px-2">
              <span className="text-sm font-medium text-primary-text">
                Page {page}
              </span>
              <span className="text-sm text-secondary-text">
                of {totalPages}
              </span>
            </div>

            <Link
              href={page < totalPages ? `/org/learners?page=${page + 1}` : "#"}
              className={`p-2 rounded-lg border border-border transition-colors ${
                page < totalPages
                  ? "bg-surface hover:bg-surface-muted text-primary-text"
                  : "bg-surface-muted text-secondary-text cursor-not-allowed opacity-50"
              }`}
              aria-disabled={page >= totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
