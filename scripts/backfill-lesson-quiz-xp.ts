/**
 * Backfill script for LESSON_COMPLETED and QUIZ_PASSED point types.
 *
 * Awards retroactive XP to all learners for:
 *  - Each completed lesson they already finished  → +2 XP  (LESSON_COMPLETED)
 *  - Each quiz they already passed                → +5 XP  (QUIZ_PASSED)
 *
 * Also re-runs the existing MODULE_COMPLETED and MODULE_QUIZZES_PASSED
 * checks to catch any that were missed due to the revalidation race condition.
 *
 * Uses onConflictDoNothing on the unique (userId, reason, referenceId) index
 * so it is safe to run multiple times.
 *
 * Usage:
 *   npx tsx scripts/backfill-lesson-quiz-xp.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

const connection = neon(process.env.DATABASE_URL!);
const db = drizzle(connection, { schema });

async function backfillLessonQuizXP() {
  console.log(
    "🔍 Scanning for completed lessons & passed quizzes with missing per-item XP...\n",
  );

  const learners = await db
    .select({ id: schema.users.id, firstName: schema.users.firstName })
    .from(schema.users)
    .where(eq(schema.users.role, "LEARNER"));

  let totalLessonXP = 0;
  let totalQuizXP = 0;
  let totalModuleXP = 0;
  let totalQuizMasteryXP = 0;

  console.log(`Found ${learners.length} learners\n`);

  for (const learner of learners) {
    const name = learner.firstName || "Anonymous";

    // ── 1. Per-lesson XP (LESSON_COMPLETED → 2 XP each) ──
    const completedLessons = await db
      .select({
        lessonId: schema.userProgress.lessonId,
      })
      .from(schema.userProgress)
      .where(
        and(
          eq(schema.userProgress.userId, learner.id),
          eq(schema.userProgress.isCompleted, true),
        ),
      );

    for (const row of completedLessons) {
      const [inserted] = await db
        .insert(schema.pointTransactions)
        .values({
          userId: learner.id,
          amount: 2,
          reason: "LESSON_COMPLETED",
          referenceId: row.lessonId,
        })
        .onConflictDoNothing()
        .returning({ id: schema.pointTransactions.id });

      if (inserted) {
        await db
          .update(schema.users)
          .set({ points: sql`${schema.users.points} + 2` })
          .where(eq(schema.users.id, learner.id));
        totalLessonXP += 2;
        console.log(`  ✅ ${name} +2 XP → lesson ${row.lessonId}`);
      }
    }

    // ── 2. Per-quiz XP (QUIZ_PASSED → 5 XP each, first pass only) ──
    // Get distinct passed quizzes (one award per quiz, even if attempted multiple times)
    const passedQuizzes = await db
      .selectDistinctOn([schema.userQuizAttempts.lessonId], {
        lessonId: schema.userQuizAttempts.lessonId,
      })
      .from(schema.userQuizAttempts)
      .where(
        and(
          eq(schema.userQuizAttempts.userId, learner.id),
          eq(schema.userQuizAttempts.passed, true),
        ),
      );

    for (const row of passedQuizzes) {
      const [inserted] = await db
        .insert(schema.pointTransactions)
        .values({
          userId: learner.id,
          amount: 5,
          reason: "QUIZ_PASSED",
          referenceId: row.lessonId,
        })
        .onConflictDoNothing()
        .returning({ id: schema.pointTransactions.id });

      if (inserted) {
        await db
          .update(schema.users)
          .set({ points: sql`${schema.users.points} + 5` })
          .where(eq(schema.users.id, learner.id));
        totalQuizXP += 5;
        console.log(`  ✅ ${name} +5 XP → quiz ${row.lessonId}`);
      }
    }

    // ── 3. Re-check MODULE_COMPLETED (10 XP) — catches race-condition misses ──
    const chapters = await db
      .select({ id: schema.chapters.id, title: schema.chapters.title })
      .from(schema.chapters);

    for (const chapter of chapters) {
      const [stats] = await db
        .select({
          totalLessons: sql<number>`count(distinct ${schema.lessons.id})`,
          completedCount: sql<number>`count(distinct ${schema.userProgress.lessonId})`,
        })
        .from(schema.lessons)
        .leftJoin(
          schema.userProgress,
          and(
            eq(schema.userProgress.lessonId, schema.lessons.id),
            eq(schema.userProgress.userId, learner.id),
            eq(schema.userProgress.isCompleted, true),
          ),
        )
        .where(eq(schema.lessons.chapterId, chapter.id));

      const total = Number(stats?.totalLessons || 0);
      const completed = Number(stats?.completedCount || 0);

      if (total > 0 && total === completed) {
        const [inserted] = await db
          .insert(schema.pointTransactions)
          .values({
            userId: learner.id,
            amount: 10,
            reason: "MODULE_COMPLETED",
            referenceId: chapter.id,
          })
          .onConflictDoNothing()
          .returning({ id: schema.pointTransactions.id });

        if (inserted) {
          await db
            .update(schema.users)
            .set({ points: sql`${schema.users.points} + 10` })
            .where(eq(schema.users.id, learner.id));
          totalModuleXP += 10;
          console.log(`  ✅ ${name} +10 XP → module "${chapter.title}"`);
        }
      }

      // ── 4. Re-check MODULE_QUIZZES_PASSED (25 XP) ──
      const [quizStats] = await db
        .select({
          totalQuizzes: sql<number>`count(distinct ${schema.lessons.id})`,
          passedQuizzes: sql<number>`count(distinct ${schema.userQuizAttempts.lessonId})`,
        })
        .from(schema.lessons)
        .leftJoin(
          schema.userQuizAttempts,
          and(
            eq(schema.userQuizAttempts.lessonId, schema.lessons.id),
            eq(schema.userQuizAttempts.userId, learner.id),
            eq(schema.userQuizAttempts.passed, true),
          ),
        )
        .where(
          and(
            eq(schema.lessons.chapterId, chapter.id),
            eq(schema.lessons.type, "QUIZ"),
          ),
        );

      const totalQ = Number(quizStats?.totalQuizzes || 0);
      const passedQ = Number(quizStats?.passedQuizzes || 0);

      if (totalQ > 0 && totalQ === passedQ) {
        const [inserted] = await db
          .insert(schema.pointTransactions)
          .values({
            userId: learner.id,
            amount: 25,
            reason: "MODULE_QUIZZES_PASSED",
            referenceId: chapter.id,
          })
          .onConflictDoNothing()
          .returning({ id: schema.pointTransactions.id });

        if (inserted) {
          await db
            .update(schema.users)
            .set({ points: sql`${schema.users.points} + 25` })
            .where(eq(schema.users.id, learner.id));
          totalQuizMasteryXP += 25;
          console.log(`  ✅ ${name} +25 XP → quiz mastery "${chapter.title}"`);
        }
      }
    }
  }

  const grandTotal =
    totalLessonXP + totalQuizXP + totalModuleXP + totalQuizMasteryXP;
  console.log("\n────────────────────────────────────────────");
  console.log(`🎉 Backfill complete!`);
  console.log(`   Lesson XP awarded:        ${totalLessonXP} XP`);
  console.log(`   Quiz XP awarded:          ${totalQuizXP} XP`);
  console.log(`   Module XP awarded:        ${totalModuleXP} XP`);
  console.log(`   Quiz Mastery XP awarded:  ${totalQuizMasteryXP} XP`);
  console.log(`   Grand Total:              ${grandTotal} XP`);

  process.exit(0);
}

backfillLessonQuizXP().catch((e) => {
  console.error("Backfill failed:", e);
  process.exit(1);
});
