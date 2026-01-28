/* eslint-disable @typescript-eslint/no-explicit-any */
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function main() {
  console.log("Attempting to add missing enum values...");

  try {
    await db.execute("ALTER TYPE status ADD VALUE IF NOT EXISTS 'SUSPENDED'");
    console.log("✓ Processed SUSPENDED");
  } catch (e: any) {
    if (e.code === "42710") {
      console.log("✓ SUSPENDED already exists");
    } else {
      console.error("✗ Failed to add SUSPENDED:", e.message);
    }
  }

  try {
    await db.execute("ALTER TYPE status ADD VALUE IF NOT EXISTS 'BANNED'");
    console.log("✓ Processed BANNED");
  } catch (e: any) {
    if (e.code === "42710") {
      console.log("✓ BANNED already exists");
    } else {
      console.error("✗ Failed to add BANNED:", e.message);
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Script error:", err);
  process.exit(1);
});
