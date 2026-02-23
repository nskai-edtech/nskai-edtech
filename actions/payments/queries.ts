"use server";

import { db } from "@/lib/db";
import {
  users,
  courses,
  learningPaths,
  learningPathCourses,
} from "@/drizzle/schema";
import { eq, sql } from "drizzle-orm";

export async function getPaymentContext(
  clerkId: string,
  itemId: string,
  type: "COURSE" | "PATH",
) {
  const userQuery = db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
    columns: { id: true, email: true, firstName: true },
  });

  const itemQuery =
    type === "COURSE"
      ? db.query.courses.findFirst({ where: eq(courses.id, itemId) })
      : db.query.learningPaths.findFirst({
          where: eq(learningPaths.id, itemId),
        });

  const [user, item] = await Promise.all([userQuery, itemQuery]);
  return { user, item };
}

export async function getPathTotalValue(pathId: string) {
  const result = await db
    .select({ total: sql<number>`sum(${courses.price})` })
    .from(learningPathCourses)
    .innerJoin(courses, eq(learningPathCourses.courseId, courses.id))
    .where(eq(learningPathCourses.learningPathId, pathId));

  return result[0]?.total || 0;
}
