"use server";

import { db } from "@/lib/db";
import {
  courses,
  chapters,
  lessons,
  users,
  userProgress,
} from "@/drizzle/schema";
import { eq, asc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { verifyCourseAccess } from "@/actions/courses/student";

export async function getCourseOutline(courseId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
    columns: { id: true },
  });

  if (!user) return null;

  return await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    with: {
      chapters: {
        orderBy: [asc(chapters.position)],
        with: {
          lessons: {
            orderBy: [asc(lessons.position)],
            columns: {
              id: true,
              title: true,
              position: true,
              isFreePreview: true,
              chapterId: true,
              type: true,
            },

            with: {
              userProgress: {
                where: eq(userProgress.userId, user.id),
              },
            },
          },
        },
      },
    },
  });
}

export async function getLessonWithAccess(courseId: string, lessonId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (!user) throw new Error("User not found");

  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      muxData: true,
      chapter: {
        with: {
          course: {
            columns: { tutorId: true, id: true },
          },
        },
      },
    },
  });

  if (!lesson || !lesson.chapter?.course) throw new Error("Lesson not found");

  if (lesson.chapter.course.id !== courseId) throw new Error("Data mismatch");

  const isOwner = lesson.chapter.course.tutorId === user.id;
  const ownsCourse = await verifyCourseAccess(user.id, courseId);
  const hasAccess = ownsCourse || lesson.isFreePreview || isOwner;

  if (!hasAccess) throw new Error("Access Denied");

  const allLessons = await db
    .select({ id: lessons.id })
    .from(lessons)
    .innerJoin(chapters, eq(lessons.chapterId, chapters.id))
    .where(eq(chapters.courseId, courseId))
    .orderBy(asc(chapters.position), asc(lessons.position));

  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);

  return {
    lesson,
    muxData: lesson.muxData,
    nextLessonId: allLessons[currentIndex + 1]?.id || null,
    prevLessonId: allLessons[currentIndex - 1]?.id || null,
    user,
  };
}
