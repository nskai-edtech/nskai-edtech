import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/drizzle/schema";

declare global {
  var database: ReturnType<typeof drizzle> | undefined;
}

const sql = neon(process.env.DATABASE_URL!);

export const db = globalThis.database || drizzle(sql, { schema });

if (process.env.NODE_ENV !== "production") {
  globalThis.database = db;
}
