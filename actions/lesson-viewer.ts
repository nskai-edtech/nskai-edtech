"use server";

import { db } from "@/lib/db";
import { courses, chapters, lessons, users } from "@/drizzle/schema";
import { eq, and, asc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { verifyCourseAccess } from "./courses";

// Get course outline (Chapters & Lessons) for sidebar
export async function getCourseOutline(courseId: string) {
  const { userId } = await auth();

  if (!userId) return null;

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    with: {
      chapters: {
        orderBy: [asc(chapters.position)],
        with: {
          lessons: {
            orderBy: [asc(lessons.position)],
            // sidebar nav items
            columns: {
              id: true,
              title: true,
              position: true,
              isFreePreview: true,
              chapterId: true,
            },
            // TODO: userProgress goes here
          },
        },
      },
    },
  });

  return course;
}

// Get specific lesson data with security check
export async function getLessonWithAccess(courseId: string, lessonId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Get User DB ID
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Check if user purchased the course OR is enrolled via bundle
  const ownsCourse = await verifyCourseAccess(user.id, courseId);

  // Get the Lesson
  const lesson = await db.query.lessons.findFirst({
    where: and(
      eq(lessons.id, lessonId),
      // Ensure lesson belongs to chapter which belongs to course
    ),
    with: {
      muxData: true,
      chapter: true,
    },
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  // Verify Access
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    columns: { tutorId: true },
  });

  const isOwner = course?.tutorId === user.id;
  const hasAccess = ownsCourse || lesson.isFreePreview || isOwner;

  if (!hasAccess) {
    throw new Error("Access Denied");
  }

  // Get Next/Prev Lesson IDs
  const allChapters = await db.query.chapters.findMany({
    where: eq(chapters.courseId, courseId),
    orderBy: [asc(chapters.position)],
    with: {
      lessons: {
        orderBy: [asc(lessons.position)],
        columns: { id: true },
      },
    },
  });

  const flatLessons = allChapters.flatMap((c) => c.lessons);
  const currentIndex = flatLessons.findIndex((l) => l.id === lessonId);

  const nextLessonId = flatLessons[currentIndex + 1]?.id || null;
  const prevLessonId = flatLessons[currentIndex - 1]?.id || null;

  return {
    lesson,
    muxData: lesson.muxData,
    nextLessonId,
    prevLessonId,
    user,
  };
}
