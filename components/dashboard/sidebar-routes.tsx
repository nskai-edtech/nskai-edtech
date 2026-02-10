"use client";

import {
  LayoutDashboard,
  BookOpen,
  BarChart,
  Settings,
  GraduationCap,
  Users,
  Shield,
  CheckCircle,
  UserCheck,
} from "lucide-react";
import { usePathname } from "next/navigation";

interface SidebarRoute {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  active: boolean;
  badgeCount?: number;
}

export const useSidebarRoutes = (
  role: "TUTOR" | "ORG_ADMIN",
  counts?: { pendingCourses?: number; pendingTutors?: number },
): SidebarRoute[] => {
  const pathname = usePathname();

  const tutorRoutes: SidebarRoute[] = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/tutor",
      active: pathname === "/tutor",
    },
    {
      icon: BookOpen,
      label: "My Courses",
      href: "/tutor/courses",
      active: pathname.includes("/tutor/courses"),
    },
    {
      icon: BarChart,
      label: "Analytics",
      href: "/tutor/analytics",
      active: pathname.includes("/tutor/analytics"),
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/tutor/settings",
      active: pathname.includes("/tutor/settings"),
    },
  ];

  const orgRoutes: SidebarRoute[] = [
    {
      icon: Shield,
      label: "Overview",
      href: "/org",
      active: pathname === "/org",
    },
    {
      icon: UserCheck,
      label: "Tutor Approvals",
      href: "/org/tutor-approvals",
      active: pathname.includes("/org/tutor-approvals"),
      badgeCount: counts?.pendingTutors,
    },
    {
      icon: CheckCircle,
      label: "Course Approvals",
      href: "/org/approvals",
      active: pathname.includes("/org/approvals"),
      badgeCount: counts?.pendingCourses,
    },
    {
      icon: GraduationCap,
      label: "Tutors",
      href: "/org/tutors",
      active: pathname.includes("/org/tutors"),
    },
    {
      icon: BookOpen,
      label: "Courses",
      href: "/org/courses",
      active: pathname.includes("/org/courses"),
    },
    {
      icon: Users,
      label: "Learners",
      href: "/org/learners",
      active: pathname.includes("/org/learners"),
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/org/settings",
      active: pathname.includes("/org/settings"),
    },
  ];

  return role === "ORG_ADMIN" ? orgRoutes : tutorRoutes;
};
