import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Testing UPDATE query...");
  try {
    // Try to update a non-existent user, just to check validity of the value
    await sql`UPDATE "user" SET status = 'SUSPENDED' WHERE id = '00000000-0000-0000-0000-000000000000'`;
    console.log("UPDATE query executed successfully (DB accepts SUSPENDED).");
  } catch (error) {
    console.error("UPDATE query FAILED:", error);
  }
}

main();
