import {
  BadgeCheck,
  BookOpen,
  Clock,
  MoreVertical,
  Star,
  Users,
} from "lucide-react";
import Image from "next/image";

// Mock Data for the Demo
const MOCK_TUTORS = [
  {
    id: "1",
    name: "Dr. Sarah Chen",
    role: "Mathematics Expert",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    rating: 4.9,
    students: 1240,
    courses: 12,
    status: "Top Rated",
    bio: "Ph.D. in Mathematics with 10+ years of teaching experience. Specializes in Calculus and Linear Algebra.",
    tags: ["Calculus", "Algebra", "Statistics"],
  },
  {
    id: "2",
    name: "Marcus Johnson",
    role: "Physics Specialist",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    rating: 4.8,
    students: 850,
    courses: 8,
    status: "Active",
    bio: "Former NASA engineer turned educator. Making complex physics concepts accessible to everyone.",
    tags: ["Physics", "Mechanics", "Astrophysics"],
  },
  {
    id: "3",
    name: "Elena Rodriguez",
    role: "Language Arts",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
    rating: 4.95,
    students: 2100,
    courses: 15,
    status: "Top Rated",
    bio: "Published author and linguist. passionate about creative writing and literature analysis.",
    tags: ["English", "Spanish", "Literature"],
  },
  {
    id: "4",
    name: "David Kim",
    role: "Computer Science",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    rating: 4.7,
    students: 920,
    courses: 10,
    status: "Active",
    bio: "Senior Software Engineer. Teaching coding fundamentals, algorithms, and web development.",
    tags: ["React", "Python", "Algorithms"],
  },
  {
    id: "5",
    name: "Jessica Wong",
    role: "Chemistry",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
    rating: 4.85,
    students: 600,
    courses: 6,
    status: "Rising Star",
    bio: "Interactive chemistry lessons with a focus on real-world applications and experiments.",
    tags: ["Chemistry", "Biology", "Lab Science"],
  },
  {
    id: "6",
    name: "Robert Fox",
    role: "History & Civics",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
    rating: 4.6,
    students: 450,
    courses: 5,
    status: "Active",
    bio: "Bringing history to life through storytelling and critical analysis of historical events.",
    tags: ["World History", "Civics", "Geography"],
  },
];

export default function TutorsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary-text flex items-center gap-3">
            <Users className="w-8 h-8 text-brand" />
            Our Tutors
          </h1>
          <p className="text-secondary-text mt-2 max-w-2xl">
            Meet our world-class educators. Each tutor is verified and brings
            extensive expertise to help your students succeed.
          </p>
        </div>
        <div>
          <button className="px-6 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-xl font-medium transition-colors shadow-lg shadow-brand/20 flex items-center gap-2">
            <span>Invite New Tutor</span>
          </button>
        </div>
      </div>

      {/* Tutors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_TUTORS.map((tutor) => (
          <div
            key={tutor.id}
            className="group relative bg-surface border border-border rounded-2xl p-6 hover:shadow-xl hover:border-brand/30 transition-all duration-300 flex flex-col"
          >
            {/* Action Menu (Mock) */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 hover:bg-surface-muted rounded-full">
                <MoreVertical className="w-4 h-4 text-secondary-text" />
              </button>
            </div>

            {/* Profile Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-surface-muted border-2 border-white dark:border-gray-800 shadow-sm">
                  <Image
                    src={tutor.avatar}
                    alt={tutor.name}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
                {tutor.status === "Top Rated" && (
                  <div className="absolute -bottom-2 -right-2 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-yellow-200 dark:border-yellow-800 flex items-center gap-0.5 shadow-sm">
                    <BadgeCheck className="w-3 h-3" />
                    TOP
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg text-primary-text group-hover:text-brand transition-colors">
                  {tutor.name}
                </h3>
                <p className="text-sm text-brand font-medium">{tutor.role}</p>
                <div className="flex items-center gap-1 mt-1 text-sm text-secondary-text">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-primary-text">
                    {tutor.rating}
                  </span>
                  <span>({tutor.students} students)</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <p className="text-sm text-secondary-text mb-6 line-clamp-2 grow">
              {tutor.bio}
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-border mb-6 bg-surface-muted/30 -mx-6 px-6">
              <div className="flex flex-col">
                <span className="text-xs text-secondary-text uppercase tracking-wider font-semibold">
                  Courses
                </span>
                <div className="flex items-center gap-1.5 font-semibold text-primary-text mt-0.5">
                  <BookOpen className="w-4 h-4 text-brand" />
                  {tutor.courses} Active
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-secondary-text uppercase tracking-wider font-semibold">
                  Availability
                </span>
                <div className="flex items-center gap-1.5 font-semibold text-green-600 dark:text-green-400 mt-0.5">
                  <Clock className="w-4 h-4" />
                  Available
                </div>
              </div>
            </div>

            {/* Tags & Footer */}
            <div className="mt-auto">
              <div className="flex flex-wrap gap-2 mb-4">
                {tutor.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-md bg-surface-muted text-xs font-medium text-secondary-text"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <button className="w-full py-2.5 rounded-xl border border-border hover:border-brand hover:text-brand text-sm font-semibold text-primary-text transition-all duration-200 bg-transparent hover:bg-brand/5">
                View Profile
              </button>
            </div>
          </div>
        ))}

        {/* Add New Card (Dotted) */}
        <button className="group flex flex-col items-center justify-center gap-4 p-6 border-2 border-dashed border-border rounded-2xl hover:border-brand/50 hover:bg-surface-muted/50 transition-all duration-300 min-h-[350px]">
          <div className="w-16 h-16 rounded-full bg-surface-muted group-hover:bg-brand/10 flex items-center justify-center transition-colors">
            <Users className="w-8 h-8 text-secondary-text group-hover:text-brand" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-lg text-primary-text mb-1">
              Invite a Tutor
            </h3>
            <p className="text-sm text-secondary-text max-w-[200px]">
              Add a new instructor to your organization&apos;s roster.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
