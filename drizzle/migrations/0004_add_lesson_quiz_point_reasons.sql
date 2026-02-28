-- Add new point_reason enum values for per-lesson and per-quiz XP
-- These are idempotent: PostgreSQL will error if the value already exists,
-- but the IF NOT EXISTS (via DO block) handles that gracefully.

DO $$ BEGIN
  ALTER TYPE "point_reason" ADD VALUE IF NOT EXISTS 'LESSON_COMPLETED';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "point_reason" ADD VALUE IF NOT EXISTS 'QUIZ_PASSED';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
