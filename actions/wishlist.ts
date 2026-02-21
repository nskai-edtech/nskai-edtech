"use server";

import { db } from "@/lib/db";
import { courses, users, courseLikes } from "@/drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { CourseWithTutor } from "./courses";

export async function getWishlistCourses(): Promise<CourseWithTutor[]> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const student = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!student) {
    throw new Error("User not found");
  }

  // Fetch courses joined with courseLikes
  const wishlistCourses = await db
    .select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
      price: courses.price,
      isPublished: courses.isPublished,
      status: courses.status,
      imageUrl: courses.imageUrl,
      createdAt: courses.createdAt,
      tutor: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        imageUrl: users.imageUrl,
      },
    })
    .from(courses)
    .innerJoin(courseLikes, eq(courses.id, courseLikes.courseId))
    .leftJoin(users, eq(courses.tutorId, users.id))
    .where(
      and(eq(courseLikes.userId, student.id), eq(courses.isPublished, true)),
    )
    .orderBy(desc(courseLikes.createdAt));

  return wishlistCourses as CourseWithTutor[];
}
