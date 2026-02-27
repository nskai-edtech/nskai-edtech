import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../drizzle/schema";
import { sql } from "drizzle-orm";

const connection = neon(process.env.DATABASE_URL!);
const db = drizzle(connection, { schema });

async function diagnose() {
  const progressCount = await db.execute(
    sql`SELECT count(*) as total, count(*) filter (where is_completed = true) as completed FROM user_progress`,
  );
  console.log("\n user_progress table:", progressCount.rows[0]);

  const completionData = await db.execute(sql`
    SELECT 
      u.first_name,
      ch.title as chapter_title,
      (SELECT count(*) FROM lesson WHERE chapter_id = ch.id) as total_in_chapter,
      count(distinct l.id) as completed_by_user
    FROM "user" u
    JOIN user_progress up ON up.user_id = u.id AND up.is_completed = true
    JOIN lesson l ON l.id = up.lesson_id
    JOIN chapter ch ON ch.id = l.chapter_id
    WHERE u.role = 'LEARNER'
    GROUP BY u.id, u.first_name, ch.id, ch.title
    ORDER BY u.first_name, completed_by_user DESC
    LIMIT 30
  `);
  console.log("\n Completion per learner per chapter:");
  console.table(completionData.rows);

  const nullChapters = await db.execute(
    sql`SELECT count(*) as null_chapter_lessons FROM lesson WHERE chapter_id IS NULL`,
  );
  console.log("\n  Lessons with null chapterId:", nullChapters.rows[0]);

  // 4. Check existing point_transactions
  const txns = await db.execute(
    sql`SELECT u.first_name, pt.reason, pt.amount, pt.reference_id, pt.created_at 
        FROM point_transaction pt JOIN "user" u ON u.id = pt.user_id 
        ORDER BY pt.created_at DESC LIMIT 10`,
  );
  console.log("\n Recent point transactions:");
  console.table(txns.rows);

  // 5. Check users.points
  const points = await db.execute(
    sql`SELECT first_name, last_name, points, current_streak FROM "user" WHERE role = 'LEARNER' ORDER BY points DESC LIMIT 10`,
  );
  console.log("\n Learner points:");
  console.table(points.rows);

  process.exit(0);
}

diagnose().catch((e) => {
  console.error(e);
  process.exit(1);
});
