"use server";

import { db } from "@/lib/db";
import { courses } from "@/drizzle/schema/courses";
import { purchases } from "@/drizzle/schema/interactions";
import { dailyWatchTime } from "@/drizzle/schema/gamification";
import { users } from "@/drizzle/schema/users";
import { eq, sql, desc } from "drizzle-orm";

export async function getLearnerStats(userId: string) {
  try {
    // Calculate total spent by joining purchases and courses and summing the course price
    const statsQuery = await db
      .select({
        totalSpent: sql<number>`SUM(${courses.price})`.mapWith(Number),
      })
      .from(purchases)
      .innerJoin(courses, eq(purchases.courseId, courses.id))
      .where(eq(purchases.userId, userId));

    // Calculate total watch time in seconds. daily_watch_time stores minutes.
    const watchTimeQuery = await db
      .select({
        totalWatchSeconds:
          sql<number>`SUM(${dailyWatchTime.minutesWatched}) * 60`.mapWith(
            Number,
          ),
      })
      .from(dailyWatchTime)
      .where(eq(dailyWatchTime.userId, userId));

    const totalSpent = statsQuery[0]?.totalSpent ?? 0;
    const totalWatchSeconds = watchTimeQuery[0]?.totalWatchSeconds ?? 0;

    return { totalSpent, totalWatchSeconds };
  } catch (error) {
    console.error("[GET_LEARNER_STATS_ERROR]", error);
    return { totalSpent: 0, totalWatchSeconds: 0 };
  }
}

export async function getPurchasedCourses(userId: string) {
  try {
    // Fetch courses bought by user, linking to the tutor's profile
    const results = await db
      .select({
        id: courses.id,
        title: courses.title,
        price: courses.price,
        imageUrl: courses.imageUrl,
        tutorFirstName: users.firstName,
        tutorLastName: users.lastName,
        purchasedAt: purchases.createdAt,
      })
      .from(purchases)
      .innerJoin(courses, eq(purchases.courseId, courses.id))
      .leftJoin(users, eq(courses.tutorId, users.id))
      .where(eq(purchases.userId, userId))
      .orderBy(desc(purchases.createdAt));

    return results.map((row) => {
      const tutorName =
        `${row.tutorFirstName || ""} ${row.tutorLastName || ""}`.trim() || null;
      return {
        id: row.id,
        title: row.title,
        price: row.price,
        imageUrl: row.imageUrl,
        tutorName,
        purchaseDate: row.purchasedAt,
      };
    });
  } catch (error) {
    console.error("[GET_PURCHASED_COURSES_ERROR]", error);
    return [];
  }
}
