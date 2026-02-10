"use client";

import { useState } from "react";
import { BookOpen, Clock, FileEdit, XCircle, Eye } from "lucide-react";
import Image from "next/image";

interface Course {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  status: "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED";
  price: number | null;
  isPublished: boolean | null;
  createdAt: Date;
  studentsEnrolled: number;
}

type TabType = "published" | "draft" | "pending" | "rejected";

interface CourseTabsProps {
  courses: Course[];
}

export function CourseTabs({ courses }: CourseTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("published");

  const tabs: {
    id: TabType;
    label: string;
    icon: React.ReactNode;
    count: number;
  }[] = [
    {
      id: "published",
      label: "Published",
      icon: <BookOpen className="w-4 h-4" />,
      count: courses.filter((c) => c.status === "PUBLISHED").length,
    },
    {
      id: "pending",
      label: "Pending Review",
      icon: <Clock className="w-4 h-4" />,
      count: courses.filter((c) => c.status === "PENDING").length,
    },
    {
      id: "draft",
      label: "Drafts",
      icon: <FileEdit className="w-4 h-4" />,
      count: courses.filter((c) => c.status === "DRAFT").length,
    },
    {
      id: "rejected",
      label: "Rejected",
      icon: <XCircle className="w-4 h-4" />,
      count: courses.filter((c) => c.status === "REJECTED").length,
    },
  ];

  const filteredCourses = courses.filter(
    (course) => course.status === activeTab.toUpperCase(),
  );

  const formatPrice = (price: number | null) => {
    if (!price) return "Free";
    return `₦${(price / 100).toLocaleString()}`;
  };

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
              {course.imageUrl ? (
                <Image
                  src={course.imageUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-secondary-text">
                  <BookOpen className="w-10 h-10" />
                </div>
              )}
              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                {course.status === "PUBLISHED" && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400">
                    Published
                  </span>
                )}
                {course.status === "PENDING" && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400">
                    Pending Review
                  </span>
                )}
                {course.status === "DRAFT" && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-900/50 text-gray-700 dark:text-gray-400">
                    Draft
                  </span>
                )}
                {course.status === "REJECTED" && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400">
                    Rejected
                  </span>
                )}
              </div>
            </div>

            {/* Course Info */}
            <div className="p-4">
              <h3 className="font-bold text-primary-text mb-1 line-clamp-1">
                {course.title}
              </h3>
              <p className="text-sm text-secondary-text mb-4 line-clamp-2">
                {course.description || "No description provided."}
              </p>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-secondary-text">
                    <Eye className="w-4 h-4" />
                    <span>{course.studentsEnrolled} students</span>
                  </div>
                  <span className="font-semibold text-primary-text">
                    {formatPrice(course.price)}
                  </span>
                </div>
                <span className="text-xs text-secondary-text">
                  {new Date(course.createdAt).toLocaleDateString()}
                </span>
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
            {activeTab === "draft" && "No draft courses."}
            {activeTab === "rejected" && "No rejected courses."}
            {activeTab === "published" &&
              "This tutor hasn't published any courses yet."}
          </p>
        </div>
      )}
    </div>
  );
}
