import { db } from "../lib/db";
import { lessons, muxData } from "../drizzle/schema";
import { eq } from "drizzle-orm";

async function main() {
  // Check Mux data linked to lessons
  const rows = await db
    .select({
      lessonId: muxData.lessonId,
      assetId: muxData.assetId,
      playbackId: muxData.playbackId,
      title: lessons.title,
    })
    .from(muxData)
    .innerJoin(lessons, eq(muxData.lessonId, lessons.id))
    .limit(10);

  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}

main().catch(console.error);
