import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users, courses } from "../drizzle/schema";
import { like, inArray } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function deleteAllSeeds() {
  console.log("🗑️  Deleting ALL seed data...\n");

  try {
    // 1. Get all seed tutor IDs
    const seedTutors = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(users)
      .where(like(users.clerkId, "tutor_seed_%"));

    if (seedTutors.length === 0) {
      console.log("ℹ️  No seed tutors found. Database is already clean.");
      return;
    }

    const seedTutorIds = seedTutors.map((t) => t.id);
    console.log(`Found ${seedTutors.length} seed tutors.`);

    // 2. Delete all courses belonging to seed tutors
    //    This cascades to: chapters → lessons → muxData, purchases, userProgress
    await db.delete(courses).where(inArray(courses.tutorId, seedTutorIds));
    console.log(
      "✅ Deleted seed courses (+ cascaded chapters, lessons, muxData, purchases, progress)",
    );

    // 3. Delete the seed tutors themselves
    await db.delete(users).where(like(users.clerkId, "tutor_seed_%"));
    console.log(`✅ Deleted ${seedTutors.length} seed tutors`);

    console.log("\n🎉 All seed data has been removed!");
  } catch (error) {
    console.error("❌ Error deleting seed data:", error);
    process.exit(1);
  }
}

deleteAllSeeds();
