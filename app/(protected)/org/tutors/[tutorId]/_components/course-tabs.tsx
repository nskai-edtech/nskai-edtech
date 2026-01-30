"use client";

import { useState } from "react";
import { BookOpen, Clock, PauseCircle, Eye } from "lucide-react";
import Image from "next/image";

type CourseStatus = "PUBLISHED" | "SUSPENDED" | "PENDING";

interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  status: CourseStatus;
  studentsEnrolled: number;
  createdAt: string;
}

// Mock course data
const MOCK_COURSES: Course[] = [
  {
    id: "c1",
    title: "Introduction to React",
    description:
      "Learn the fundamentals of React including components, hooks, and state management.",
    imageUrl:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop",
    status: "PUBLISHED",
    studentsEnrolled: 245,
    createdAt: "2024-01-15",
  },
  {
    id: "c2",
    title: "Advanced TypeScript Patterns",
    description:
      "Master advanced TypeScript concepts like generics, utility types, and decorators.",
    imageUrl:
      "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop",
    status: "PUBLISHED",
    studentsEnrolled: 128,
    createdAt: "2024-02-20",
  },
  {
    id: "c3",
    title: "Node.js Backend Development",
    description:
      "Build scalable backend applications with Node.js, Express, and databases.",
    imageUrl:
      "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop",
    status: "SUSPENDED",
    studentsEnrolled: 89,
    createdAt: "2024-03-10",
  },
  {
    id: "c4",
    title: "Docker & Kubernetes Essentials",
    description:
      "Learn containerization and orchestration for modern cloud deployments.",
    imageUrl:
      "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&h=300&fit=crop",
    status: "PENDING",
    studentsEnrolled: 0,
    createdAt: "2024-04-05",
  },
  {
    id: "c5",
    title: "GraphQL API Design",
    description:
      "Design and implement efficient GraphQL APIs with Apollo Server.",
    imageUrl:
      "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=300&fit=crop",
    status: "PUBLISHED",
    studentsEnrolled: 67,
    createdAt: "2024-04-15",
  },
  {
    id: "c6",
    title: "Machine Learning Fundamentals",
    description:
      "Introduction to ML concepts, algorithms, and practical implementations.",
    imageUrl:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop",
    status: "PENDING",
    studentsEnrolled: 0,
    createdAt: "2024-05-01",
  },
];

type TabType = "all" | "suspended" | "pending";

export function CourseTabs() {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const tabs: {
    id: TabType;
    label: string;
    icon: React.ReactNode;
    count: number;
  }[] = [
    {
      id: "all",
      label: "All Courses",
      icon: <BookOpen className="w-4 h-4" />,
      count: MOCK_COURSES.filter((c) => c.status === "PUBLISHED").length,
    },
    {
      id: "suspended",
      label: "Suspended",
      icon: <PauseCircle className="w-4 h-4" />,
      count: MOCK_COURSES.filter((c) => c.status === "SUSPENDED").length,
    },
    {
      id: "pending",
      label: "Review Pending",
      icon: <Clock className="w-4 h-4" />,
      count: MOCK_COURSES.filter((c) => c.status === "PENDING").length,
    },
  ];

  const filteredCourses = MOCK_COURSES.filter((course) => {
    if (activeTab === "all") return course.status === "PUBLISHED";
    if (activeTab === "suspended") return course.status === "SUSPENDED";
    if (activeTab === "pending") return course.status === "PENDING";
    return true;
  });

  return (
    <div className="mt-8">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-brand text-white shadow-md"
                : "bg-surface-muted text-secondary-text hover:bg-surface-muted/80"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id
                  ? "bg-white/20 text-white"
                  : "bg-surface text-secondary-text"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-surface border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Course Image */}
            <div className="relative h-40 bg-surface-muted">
              <Image
                src={course.imageUrl}
                alt={course.title}
                fill
                className="object-cover"
              />
              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                {course.status === "PUBLISHED" && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400">
                    Published
                  </span>
                )}
                {course.status === "SUSPENDED" && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400">
                    Suspended
                  </span>
                )}
                {course.status === "PENDING" && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400">
                    Pending Review
                  </span>
                )}
              </div>
            </div>

            {/* Course Info */}
            <div className="p-4">
              <h3 className="font-bold text-primary-text mb-2 line-clamp-1">
                {course.title}
              </h3>
              <p className="text-sm text-secondary-text mb-4 line-clamp-2">
                {course.description}
              </p>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-secondary-text">
                  <Eye className="w-4 h-4" />
                  <span>{course.studentsEnrolled} students</span>
                </div>
                <span className="text-xs text-secondary-text">
                  {new Date(course.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                {course.status === "PENDING" && (
                  <>
                    <button className="flex-1 py-2 px-3 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors">
                      Approve
                    </button>
                    <button className="flex-1 py-2 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors">
                      Reject
                    </button>
                  </>
                )}
                {course.status === "SUSPENDED" && (
                  <button className="flex-1 py-2 px-3 rounded-lg bg-brand hover:bg-brand/90 text-white text-sm font-medium transition-colors">
                    Reinstate Course
                  </button>
                )}
                {course.status === "PUBLISHED" && (
                  <button className="flex-1 py-2 px-3 rounded-lg border border-border hover:border-brand hover:text-brand text-primary-text text-sm font-medium transition-colors">
                    View Details
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-12 bg-surface-muted/30 rounded-xl">
          <BookOpen className="w-12 h-12 text-secondary-text mx-auto mb-3" />
          <h3 className="font-semibold text-primary-text mb-1">
            No Courses Found
          </h3>
          <p className="text-sm text-secondary-text">
            {activeTab === "pending" && "No courses awaiting review."}
            {activeTab === "suspended" && "No suspended courses."}
            {activeTab === "all" &&
              "This tutor hasn't published any courses yet."}
          </p>
        </div>
      )}
    </div>
  );
}
