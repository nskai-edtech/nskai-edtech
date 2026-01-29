import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users } from "../drizzle/schema";
import { like } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function deleteSeedTutors() {
  console.log("🗑️  Deleting existing seed tutors...");

  try {
    const result = await db
      .delete(users)
      .where(like(users.clerkId, "tutor_seed_%"));

    console.log("✅ Deleted seed tutors successfully!");
    return result;
  } catch (error) {
    console.error("❌ Error deleting seed tutors:", error);
    process.exit(1);
  }
}

deleteSeedTutors();
