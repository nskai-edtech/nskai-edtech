CREATE TYPE "public"."live_session_status" AS ENUM('SCHEDULED', 'LIVE', 'ENDED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."live_session_host_role" AS ENUM('ORG_ADMIN', 'TUTOR');--> statement-breakpoint
CREATE TABLE "live_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"host_id" text NOT NULL,
	"host_role" "live_session_host_role" NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"channel_name" varchar(255) NOT NULL,
	"status" "live_session_status" DEFAULT 'SCHEDULED' NOT NULL,
	"thumbnail_url" text,
	"recording_url" text,
	"guest_access_enabled" boolean DEFAULT false NOT NULL,
	"guest_invite_code" varchar(128),
	"guest_invite_rotated_at" timestamp with time zone,
	"guest_invite_expires_at" timestamp with time zone,
	"starts_at" timestamp with time zone NOT NULL,
	"scheduled_ends_at" timestamp with time zone,
	"actual_started_at" timestamp with time zone,
	"actual_ended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "live_session_viewers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"learner_id" text NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now(),
	"left_at" timestamp with time zone,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "live_session_viewers" ADD CONSTRAINT "live_session_viewers_session_id_live_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."live_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "live_sessions_host_id_idx" ON "live_sessions" USING btree ("host_id");--> statement-breakpoint
CREATE INDEX "live_sessions_host_role_idx" ON "live_sessions" USING btree ("host_role");--> statement-breakpoint
CREATE INDEX "live_sessions_status_idx" ON "live_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "live_sessions_starts_at_idx" ON "live_sessions" USING btree ("starts_at");--> statement-breakpoint
CREATE UNIQUE INDEX "live_sessions_channel_name_idx" ON "live_sessions" USING btree ("channel_name");--> statement-breakpoint
CREATE UNIQUE INDEX "live_sessions_guest_invite_code_idx" ON "live_sessions" USING btree ("guest_invite_code");--> statement-breakpoint
CREATE INDEX "live_session_viewers_session_id_idx" ON "live_session_viewers" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "live_session_viewers_learner_id_idx" ON "live_session_viewers" USING btree ("learner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "live_session_viewers_session_learner_unique_idx" ON "live_session_viewers" USING btree ("session_id", "learner_id");
