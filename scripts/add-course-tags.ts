import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Adding tags column to course table...");
  await sql`ALTER TABLE "course" ADD COLUMN IF NOT EXISTS "tags" text[] DEFAULT '{}'`;
  console.log("Done. Verifying...");
  const result = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'course' AND column_name = 'tags'`;
  console.log("Column:", result);
}

main().catch(console.error);
