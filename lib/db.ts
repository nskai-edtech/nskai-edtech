import { neon } from "@neondatabase/serverless";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "@/drizzle/schema/index";

declare global {
  var drizzle: NeonHttpDatabase<typeof schema> | undefined;
}

const sql = neon(process.env.DATABASE_URL!);

export const db = globalThis.drizzle || drizzle(sql, { schema });

if (process.env.NODE_ENV !== "production") {
  globalThis.drizzle = db;
}
