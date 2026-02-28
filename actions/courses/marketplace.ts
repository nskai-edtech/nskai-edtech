"use server";

import { db } from "@/lib/db";
import { courses, users } from "@/drizzle/schema";
import {
  eq,
  desc,
  count,
  and,
  or,
  ilike,
  not,
  SQL,
  sql,
  isNull,
} from "drizzle-orm";
import {
  CourseWithTutor,
  PaginatedCoursesResult,
  SortOption,
  PriceFilter,
} from "./types";
import { auth } from "@clerk/nextjs/server";

function escapeIlike(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

export async function getUserInterests(): Promise<{
  interests: string[];
  userId: string | null;
}> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { interests: [], userId: null };

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
      columns: { id: true, interests: true },
    });

    return {
      interests: user?.interests ?? [],
      userId: user?.id ?? null,
    };
  } catch {
    return { interests: [], userId: null };
  }
}

export async function getMarketplaceCourses(
  page = 1,
  limit = 20,
  search?: string,
  filters?: {
    tags?: string[];
    priceFilter?: PriceFilter;
    sortBy?: SortOption;
  },
): Promise<PaginatedCoursesResult> {
  const offset = (page - 1) * limit;
  const { tags, priceFilter, sortBy } = filters ?? {};

  const conditions: (SQL | undefined)[] = [eq(courses.status, "PUBLISHED")];

  // Text search
  if (search) {
    const safe = escapeIlike(search);
    conditions.push(
      or(
        ilike(courses.title, `%${safe}%`),
        ilike(courses.description, `%${safe}%`),
      ),
    );
  }

  // Tag filter
  if (tags && tags.length > 0) {
    const tagArray = `{${tags.map((t) => `"${escapeIlike(t)}"`).join(",")}}`;
    conditions.push(sql`${courses.tags} && ${tagArray}::text[]`);
  }

  // Price filter
  if (priceFilter === "free") {
    conditions.push(or(isNull(courses.price), eq(courses.price, 0)));
  } else if (priceFilter === "paid") {
    conditions.push(sql`${courses.price} > 0`);
  }

  const whereClause = and(...conditions);

  // Count total
  const [countResult] = await db
    .select({ count: count() })
    .from(courses)
    .where(whereClause);
  const totalCount = countResult?.count ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  // Determine sort order
  let orderBy: SQL;
  switch (sortBy) {
    case "price-asc":
      orderBy = sql`${courses.price} ASC NULLS FIRST`;
      break;
    case "price-desc":
      orderBy = sql`${courses.price} DESC NULLS LAST`;
      break;
    case "popular":
      orderBy = sql`(SELECT COUNT(*) FROM purchase p WHERE p.course_id = ${courses.id}) DESC, ${courses.createdAt} DESC`;
      break;
    case "rating":
      orderBy = sql`COALESCE((SELECT AVG(r.rating) FROM review r WHERE r.course_id = ${courses.id}), 0) DESC, ${courses.createdAt} DESC`;
      break;
    case "newest":
    default:
      orderBy = sql`${courses.createdAt} DESC`;
      break;
  }

  const coursesData = await db
    .select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
      price: courses.price,
      status: courses.status,
      imageUrl: courses.imageUrl,
      tags: courses.tags,
      createdAt: courses.createdAt,
      tutor: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        imageUrl: users.imageUrl,
      },
    })
    .from(courses)
    .leftJoin(users, eq(courses.tutorId, users.id))
    .where(whereClause)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  return {
    courses: coursesData,
    totalCount,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export async function getCourseById(courseId: string) {
  return await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    with: {
      tutor: true,
      chapters: {
        orderBy: (chapters, { asc }) => [asc(chapters.position)],
        with: {
          lessons: {
            orderBy: (lessons, { asc }) => [asc(lessons.position)],
            with: { muxData: true, assignment: true },
          },
        },
      },
    },
  });
}

export async function getCourseStatus(courseId: string) {
  try {
    const course = await db.query.courses.findFirst({
      where: eq(courses.id, courseId),
      columns: { status: true },
    });
    return { status: course?.status || null };
  } catch (error) {
    console.error("Failed to get course status:", error);
    return { error: "Failed to get course status" };
  }
}

export async function getRelatedCourses(courseId: string, tutorId: string) {
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    columns: { tags: true },
  });

  const courseTags = course?.tags ?? [];
  const maxResults = 6;
  const results: CourseWithTutor[] = [];
  const seenIds = new Set<string>([courseId]);

  const addUnique = (items: CourseWithTutor[]) => {
    for (const item of items) {
      if (!seenIds.has(item.id) && results.length < maxResults) {
        seenIds.add(item.id);
        results.push(item);
      }
    }
  };

  if (courseTags.length > 0) {
    const tagArray = `{${courseTags.map((t) => `"${t}"`).join(",")}}`;
    const tagMatches = await db.execute(sql`
      SELECT
        c.id, c.title, c.description, c.price, c.status,
        c.image_url AS "imageUrl", c.created_at AS "createdAt",
        u.id AS "tutorId", u.first_name AS "tutorFirstName",
        u.last_name AS "tutorLastName", u.image_url AS "tutorImageUrl",
        COALESCE(array_length(
          ARRAY(SELECT unnest(c.tags) INTERSECT SELECT unnest(${tagArray}::text[])),
          1
        ), 0) AS "overlapCount"
      FROM course c
      LEFT JOIN "user" u ON c.tutor_id = u.id
      WHERE c.status = 'PUBLISHED'
        AND c.id != ${courseId}::uuid
        AND c.tags && ${tagArray}::text[]
      ORDER BY "overlapCount" DESC, c.created_at DESC
      LIMIT ${maxResults}
    `);

    const rows = (tagMatches.rows ?? tagMatches) as Record<string, unknown>[];
    addUnique(
      rows.map((r) => ({
        id: r.id as string,
        title: r.title as string,
        description: r.description as string | null,
        price: r.price as number | null,
        status: r.status as CourseWithTutor["status"],
        imageUrl: r.imageUrl as string | null,
        createdAt: new Date(r.createdAt as string),
        tutor: r.tutorId
          ? {
              id: r.tutorId as string,
              firstName: r.tutorFirstName as string | null,
              lastName: r.tutorLastName as string | null,
              imageUrl: r.tutorImageUrl as string | null,
            }
          : null,
      })),
    );
  }

  if (results.length < maxResults) {
    const excludeIds = Array.from(seenIds);
    const tutorCourses = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        price: courses.price,
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
      .leftJoin(users, eq(courses.tutorId, users.id))
      .where(
        and(
          eq(courses.tutorId, tutorId),
          eq(courses.status, "PUBLISHED"),
          ...excludeIds.map((eid) => not(eq(courses.id, eid))),
        ),
      )
      .limit(maxResults - results.length);

    addUnique(tutorCourses as CourseWithTutor[]);
  }

  if (results.length < maxResults) {
    const excludeIds = Array.from(seenIds);
    const otherCourses = await db
      .select({
        id: courses.id,
        title: courses.title,
        description: courses.description,
        price: courses.price,
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
      .leftJoin(users, eq(courses.tutorId, users.id))
      .where(
        and(
          eq(courses.status, "PUBLISHED"),
          ...excludeIds.map((eid) => not(eq(courses.id, eid))),
        ),
      )
      .orderBy(desc(courses.createdAt))
      .limit(maxResults - results.length);

    addUnique(otherCourses as CourseWithTutor[]);
  }

  return results;
}
