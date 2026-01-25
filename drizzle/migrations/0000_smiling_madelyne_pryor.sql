CREATE TYPE "public"."role" AS ENUM('ADMIN', 'TUTOR', 'LEARNER');--> statement-breakpoint
CREATE TABLE "chapter" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid,
	"title" text NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"tutor_id" uuid,
	"price" integer,
	"is_published" boolean DEFAULT false,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chapter_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"video_url" text,
	"position" integer NOT NULL,
	"is_free_preview" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mux_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid,
	"asset_id" text NOT NULL,
	"playback_id" text,
	CONSTRAINT "mux_data_lesson_id_unique" UNIQUE("lesson_id")
);
--> statement-breakpoint
CREATE TABLE "purchase" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"course_id" uuid,
	"paystack_reference" text NOT NULL,
	"amount" integer NOT NULL,
	"status" text DEFAULT 'success',
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "purchase_paystack_reference_unique" UNIQUE("paystack_reference")
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"lesson_id" uuid,
	"is_completed" boolean DEFAULT false,
	"last_accessed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL,
	"email" text NOT NULL,
	"role" "role" DEFAULT 'LEARNER' NOT NULL,
	"image_url" text,
	"paystack_customer_code" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
ALTER TABLE "chapter" ADD CONSTRAINT "chapter_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course" ADD CONSTRAINT "course_tutor_id_user_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_chapter_id_chapter_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapter"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mux_data" ADD CONSTRAINT "mux_data_lesson_id_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_lesson_id_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lesson"("id") ON DELETE cascade ON UPDATE no action;