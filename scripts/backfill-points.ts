import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

const connection = neon(process.env.DATABASE_URL!);
const db = drizzle(connection, { schema });

async function backfillPoints() {
  console.log("🔍 Scanning for completed modules with missing points...\n");

  const learners = await db
    .select({ id: schema.users.id, firstName: schema.users.firstName })
    .from(schema.users)
    .where(eq(schema.users.role, "LEARNER"));

  let totalAwarded = 0;

  console.log(`Found ${learners.length} learners`);

  for (const learner of learners) {
    const chapters = await db
      .select({ id: schema.chapters.id, title: schema.chapters.title })
      .from(schema.chapters);

    console.log(`\nChecking ${learner.firstName || "Anonymous"} across ${chapters.length} chapters...`);

    for (const chapter of chapters) {
      // --- Module completion check ---
      const [stats] = await db
        .select({
          totalLessons: sql<number>`count(distinct ${schema.lessons.id})`,
          completedCount: sql<number>`count(distinct ${schema.userProgress.id})`,
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

      if (total > 0) {
        console.log(`  "${chapter.title}": ${completed}/${total} lessons completed`);
      }

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
          totalAwarded += 10;
          console.log(
            `  ✅ ${learner.firstName || "Learner"} +10 XP → module "${chapter.title}"`,
          );
        }
      }

      // --- Quiz mastery check ---
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
          totalAwarded += 25;
          console.log(
            `  ✅ ${learner.firstName || "Learner"} +25 XP → quiz mastery "${chapter.title}"`,
          );
        }
      }
    }
  }

  console.log(`\n🎉 Backfill complete. Total XP awarded: ${totalAwarded}`);
  process.exit(0);
}

backfillPoints().catch((e) => {
  console.error("Backfill failed:", e);
  process.exit(1);
});
