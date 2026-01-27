"use client";

import {
  LayoutDashboard,
  BookOpen,
  BarChart,
  Settings,
  GraduationCap,
  Users,
  Shield,
} from "lucide-react";
import { usePathname } from "next/navigation";

export const useSidebarRoutes = (role: "TUTOR" | "ORG_ADMIN") => {
  const pathname = usePathname();

  const tutorRoutes = [
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

  const orgRoutes = [
    {
      icon: Shield,
      label: "Overview",
      href: "/org",
      active: pathname === "/org",
    },
    {
      icon: GraduationCap,
      label: "Tutors",
      href: "/org/tutors",
      active: pathname.includes("/org/tutors"),
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
