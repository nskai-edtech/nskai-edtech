import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { courses } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Static pages
  const staticRoutes = [
    "",
    "/about",
    "/features",
    "/pricing",
    "/contact",
    "/sign-in",
    "/sign-up",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 1,
  }));

  // Fetch published courses (assuming all in DB are valid for now)
  const allCourses = await db
    .select({
      id: courses.id,
      createdAt: courses.createdAt,
    })
    .from(courses)
    .where(eq(courses.isPublished, true));

  const courseRoutes = allCourses.map((course) => ({
    url: `${baseUrl}/courses/${course.id}`,
    lastModified: course.createdAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...courseRoutes];
}
