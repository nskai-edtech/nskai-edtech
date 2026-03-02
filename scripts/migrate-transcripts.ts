/**
 * One-time migration script: move auto-cached transcripts from `lessons.notes`
 * into the dedicated `lessons.transcript` column.
 *
 * Previously the chat route cached Mux transcripts into `notes` with a
 * "[AUTO-TRANSCRIPT]\n" prefix. This script:
 *   1. Finds all lessons whose `notes` starts with "[AUTO-TRANSCRIPT]\n"
 *   2. Copies the transcript text (without the prefix) into `lessons.transcript`
 *   3. Sets `notes` to NULL for those rows (they were never real tutor notes)
 *
 * Usage:
 *   npx tsx scripts/migrate-transcripts.ts
 */

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Wrap in async IIFE — top-level await not supported in CJS mode
(async () => {
  const { db } = await import("@/lib/db");
  const { lessons } = await import("@/drizzle/schema");
  const { eq, like } = await import("drizzle-orm");

  const AUTO_PREFIX = "[AUTO-TRANSCRIPT]\n";

  console.log("🔍 Finding lessons with auto-cached transcripts in notes...");

  const rows = await db
    .select({ id: lessons.id, notes: lessons.notes, transcript: lessons.transcript })
    .from(lessons)
    .where(like(lessons.notes, "[AUTO-TRANSCRIPT]%"));

  console.log(`Found ${rows.length} lesson(s) with auto-transcript in notes.`);

  let migrated = 0;
  let skipped = 0;

  for (const row of rows) {
    if (!row.notes?.startsWith(AUTO_PREFIX)) {
      skipped++;
      continue;
    }

    const transcriptText = row.notes.slice(AUTO_PREFIX.length).trim();
    if (!transcriptText) {
      console.warn(
        `  ⚠ Lesson ${row.id}: auto-transcript prefix found but no text. Clearing notes.`,
      );
      await db
        .update(lessons)
        .set({ notes: null })
        .where(eq(lessons.id, row.id));
      skipped++;
      continue;
    }

    // Only overwrite transcript if it's currently empty
    if (row.transcript) {
      console.log(
        `  ℹ Lesson ${row.id}: already has a transcript column value. Clearing notes only.`,
      );
      await db
        .update(lessons)
        .set({ notes: null })
        .where(eq(lessons.id, row.id));
    } else {
      await db
        .update(lessons)
        .set({ transcript: transcriptText, notes: null })
        .where(eq(lessons.id, row.id));
    }

    migrated++;
    console.log(
      `  ✅ Lesson ${row.id}: migrated (${transcriptText.length} chars)`,
    );
  }

  console.log(`\n✅ Done. Migrated: ${migrated}, Skipped: ${skipped}`);
  process.exit(0);
})().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
