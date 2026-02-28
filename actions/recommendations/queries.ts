"use server";

import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { RecommendedCourse } from "./types";

function escapeIlike(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

export async function fetchCoursesByInterests(
  interests: string[],
  userId: string,
  limit: number,
): Promise<RecommendedCourse[]> {
  if (interests.length === 0) return [];

  const interestArray = `{${interests.map((i) => `"${escapeIlike(i)}"`).join(",")}}`;

  const rows = await db.execute(sql`
    SELECT
      c.id,
      c.title,
      c.description,
      c.price,
      c.status,
      c.image_url AS "imageUrl",
      c.tags,
      c.created_at AS "createdAt",
      u.id AS "tutorId",
      u.first_name AS "tutorFirstName",
      u.last_name AS "tutorLastName",
      u.image_url AS "tutorImageUrl",
      COALESCE(array_length(
        ARRAY(SELECT unnest(c.tags) INTERSECT SELECT unnest(${interestArray}::text[])),
        1
      ), 0) AS "matchCount"
    FROM course c
    LEFT JOIN "user" u ON c.tutor_id = u.id
    WHERE c.status = 'PUBLISHED'
      AND c.tags IS NOT NULL
      AND c.tags && ${interestArray}::text[]
      AND NOT EXISTS (
        SELECT 1 FROM purchase p
        WHERE p.course_id = c.id AND p.user_id = ${userId}
      )
    ORDER BY "matchCount" DESC, c.created_at DESC
    LIMIT ${limit}
  `);

  return (rows.rows ?? rows).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    title: row.title as string,
    description: row.description as string | null,
    price: row.price as number | null,
    status: row.status as RecommendedCourse["status"],
    imageUrl: row.imageUrl as string | null,
    tags: row.tags as string[] | null,
    createdAt: new Date(row.createdAt as string),
    matchCount: Number(row.matchCount),
    matchScore: Math.round(
      (Number(row.matchCount) / interests.length) * 100,
    ),
    enrollmentCount: 0,
    averageRating: null,
    tutor: row.tutorId
      ? {
          id: row.tutorId as string,
          firstName: row.tutorFirstName as string | null,
          lastName: row.tutorLastName as string | null,
          imageUrl: row.tutorImageUrl as string | null,
        }
      : null,
  }));
}

export async function fetchPopularCourses(
  userId: string,
  limit: number,
  excludeIds: string[] = [],
): Promise<RecommendedCourse[]> {
  const rows = await db.execute(sql`
    SELECT
      c.id,
      c.title,
      c.description,
      c.price,
      c.status,
      c.image_url AS "imageUrl",
      c.tags,
      c.created_at AS "createdAt",
      u.id AS "tutorId",
      u.first_name AS "tutorFirstName",
      u.last_name AS "tutorLastName",
      u.image_url AS "tutorImageUrl",
      COUNT(p.id)::int AS "enrollmentCount"
    FROM course c
    LEFT JOIN "user" u ON c.tutor_id = u.id
    LEFT JOIN purchase p ON p.course_id = c.id
    WHERE c.status = 'PUBLISHED'
      AND NOT EXISTS (
        SELECT 1 FROM purchase p2
        WHERE p2.course_id = c.id AND p2.user_id = ${userId}
      )
      ${excludeIds.length > 0 ? sql`AND c.id NOT IN (${sql.join(excludeIds.map((id) => sql`${id}::uuid`), sql`, `)})` : sql``}
    GROUP BY c.id, u.id
    ORDER BY "enrollmentCount" DESC, c.created_at DESC
    LIMIT ${limit}
  `);

  return (rows.rows ?? rows).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    title: row.title as string,
    description: row.description as string | null,
    price: row.price as number | null,
    status: row.status as RecommendedCourse["status"],
    imageUrl: row.imageUrl as string | null,
    tags: row.tags as string[] | null,
    createdAt: new Date(row.createdAt as string),
    matchScore: 0,
    enrollmentCount: Number(row.enrollmentCount),
    averageRating: null,
    tutor: row.tutorId
      ? {
          id: row.tutorId as string,
          firstName: row.tutorFirstName as string | null,
          lastName: row.tutorLastName as string | null,
          imageUrl: row.tutorImageUrl as string | null,
        }
      : null,
  }));
}

export async function fetchHighlyRatedCourses(
  userId: string,
  limit: number,
  excludeIds: string[] = [],
): Promise<RecommendedCourse[]> {
  const rows = await db.execute(sql`
    SELECT
      c.id,
      c.title,
      c.description,
      c.price,
      c.status,
      c.image_url AS "imageUrl",
      c.tags,
      c.created_at AS "createdAt",
      u.id AS "tutorId",
      u.first_name AS "tutorFirstName",
      u.last_name AS "tutorLastName",
      u.image_url AS "tutorImageUrl",
      ROUND(AVG(r.rating)::numeric, 1) AS "averageRating",
      COUNT(DISTINCT r.id)::int AS "reviewCount"
    FROM course c
    LEFT JOIN "user" u ON c.tutor_id = u.id
    INNER JOIN review r ON r.course_id = c.id
    WHERE c.status = 'PUBLISHED'
      AND NOT EXISTS (
        SELECT 1 FROM purchase p
        WHERE p.course_id = c.id AND p.user_id = ${userId}
      )
      ${excludeIds.length > 0 ? sql`AND c.id NOT IN (${sql.join(excludeIds.map((id) => sql`${id}::uuid`), sql`, `)})` : sql``}
    GROUP BY c.id, u.id
    HAVING AVG(r.rating) >= 3.5 AND COUNT(r.id) >= 2
    ORDER BY "averageRating" DESC, "reviewCount" DESC
    LIMIT ${limit}
  `);

  return (rows.rows ?? rows).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    title: row.title as string,
    description: row.description as string | null,
    price: row.price as number | null,
    status: row.status as RecommendedCourse["status"],
    imageUrl: row.imageUrl as string | null,
    tags: row.tags as string[] | null,
    createdAt: new Date(row.createdAt as string),
    matchScore: 0,
    enrollmentCount: 0,
    averageRating: Number(row.averageRating),
    tutor: row.tutorId
      ? {
          id: row.tutorId as string,
          firstName: row.tutorFirstName as string | null,
          lastName: row.tutorLastName as string | null,
          imageUrl: row.tutorImageUrl as string | null,
        }
      : null,
  }));
}

export async function fetchFallbackCourses(
  userId: string,
  limit: number,
  excludeIds: string[] = [],
): Promise<RecommendedCourse[]> {
  const rows = await db.execute(sql`
    SELECT
      c.id,
      c.title,
      c.description,
      c.price,
      c.status,
      c.image_url AS "imageUrl",
      c.tags,
      c.created_at AS "createdAt",
      u.id AS "tutorId",
      u.first_name AS "tutorFirstName",
      u.last_name AS "tutorLastName",
      u.image_url AS "tutorImageUrl"
    FROM course c
    LEFT JOIN "user" u ON c.tutor_id = u.id
    WHERE c.status = 'PUBLISHED'
      AND NOT EXISTS (
        SELECT 1 FROM purchase p
        WHERE p.course_id = c.id AND p.user_id = ${userId}
      )
      ${excludeIds.length > 0 ? sql`AND c.id NOT IN (${sql.join(excludeIds.map((id) => sql`${id}::uuid`), sql`, `)})` : sql``}
    ORDER BY c.created_at DESC
    LIMIT ${limit}
  `);

  return (rows.rows ?? rows).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    title: row.title as string,
    description: row.description as string | null,
    price: row.price as number | null,
    status: row.status as RecommendedCourse["status"],
    imageUrl: row.imageUrl as string | null,
    tags: row.tags as string[] | null,
    createdAt: new Date(row.createdAt as string),
    matchScore: 0,
    enrollmentCount: 0,
    averageRating: null,
    tutor: row.tutorId
      ? {
          id: row.tutorId as string,
          firstName: row.tutorFirstName as string | null,
          lastName: row.tutorLastName as string | null,
          imageUrl: row.tutorImageUrl as string | null,
        }
      : null,
  }));
}
