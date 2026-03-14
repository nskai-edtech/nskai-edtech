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
  Layers,
  FileText,
  Target,
  School,
  Video,
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
  counts?: {
    pendingCourses?: number;
    pendingTutors?: number;
    pendingSubmissions?: number;
    pendingRequests?: number;
    pendingSchools?: number;
  },
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
      icon: FileText,
      label: "Submissions",
      href: "/tutor/submissions",
      active: pathname.includes("/tutor/submissions"),
      badgeCount: counts?.pendingSubmissions,
    },
    {
      icon: Video,
      label: "Live Sessions",
      href: "/tutor/live-sessions",
      active: pathname.includes("/tutor/live-sessions"),
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
      icon: School,
      label: "School Approvals",
      href: "/org/school-approvals",
      active: pathname.includes("/org/school-approvals"),
      badgeCount: counts?.pendingSchools,
    },
    {
      icon: FileText,
      label: "Course Requests",
      href: "/org/requests",
      active: pathname.includes("/org/requests"),
      badgeCount: counts?.pendingRequests,
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
      icon: Layers,
      label: "Learning Paths",
      href: "/org/paths",
      active: pathname.includes("/org/paths"),
    },
    {
      icon: Users,
      label: "Learners",
      href: "/org/learners",
      active: pathname.includes("/org/learners"),
    },
    {
      icon: School,
      label: "Schools", 
      href: "/org/schools",
      active: pathname.includes("/org/schools") && !pathname.includes("schema"),
    },
    {
      icon: Target,
      label: "Skills",
      href: "/org/skills",
      active: pathname.includes("/org/skills"),
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
