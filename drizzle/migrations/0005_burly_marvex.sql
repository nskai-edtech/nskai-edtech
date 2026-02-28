CREATE TYPE "public"."assignment_submission_status" AS ENUM('PENDING', 'GRADED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."point_reason" AS ENUM('LESSON_COMPLETED', 'QUIZ_PASSED', 'MODULE_COMPLETED', 'MODULE_QUIZZES_PASSED', 'STREAK_7_DAYS');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."request_type" AS ENUM('DRAFT', 'DELETE');--> statement-breakpoint
CREATE TABLE "learning_path_course" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learning_path_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_path" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"price" integer,
	"is_published" boolean DEFAULT false,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_learning_path" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"learning_path_id" uuid NOT NULL,
	"paystack_reference" text,
	"amount" integer,
	"is_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_learning_path_paystack_reference_unique" UNIQUE("paystack_reference")
);
--> statement-breakpoint
CREATE TABLE "daily_watch_time" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"record_date" date NOT NULL,
	"minutes_watched" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "point_transaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"reason" "point_reason" NOT NULL,
	"reference_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assignment_submission" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assignment_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"file_url" text NOT NULL,
	"status" "assignment_submission_status" DEFAULT 'PENDING' NOT NULL,
	"score" integer,
	"feedback" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"graded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "assignment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"max_score" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "assignment_lesson_id_unique" UNIQUE("lesson_id")
);
--> statement-breakpoint
CREATE TABLE "course_request" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "request_type" NOT NULL,
	"reason" text NOT NULL,
	"status" "request_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "certificate" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"course_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chapter" ALTER COLUMN "course_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase" ALTER COLUMN "course_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "course" ADD COLUMN "tags" text[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "last_playback_position" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_quiz_attempt" ADD COLUMN "answers" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "points" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "current_streak" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "longest_streak" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "streak_last_active_date" timestamp;--> statement-breakpoint
ALTER TABLE "learning_path_course" ADD CONSTRAINT "learning_path_course_learning_path_id_learning_path_id_fk" FOREIGN KEY ("learning_path_id") REFERENCES "public"."learning_path"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_path_course" ADD CONSTRAINT "learning_path_course_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_learning_path" ADD CONSTRAINT "user_learning_path_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_learning_path" ADD CONSTRAINT "user_learning_path_learning_path_id_learning_path_id_fk" FOREIGN KEY ("learning_path_id") REFERENCES "public"."learning_path"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_watch_time" ADD CONSTRAINT "daily_watch_time_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "point_transaction" ADD CONSTRAINT "point_transaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_submission" ADD CONSTRAINT "assignment_submission_assignment_id_assignment_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_submission" ADD CONSTRAINT "assignment_submission_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_lesson_id_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_request" ADD CONSTRAINT "course_request_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_request" ADD CONSTRAINT "course_request_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificate" ADD CONSTRAINT "certificate_user_id_user_clerk_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("clerk_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificate" ADD CONSTRAINT "certificate_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lpc_learning_path_id_idx" ON "learning_path_course" USING btree ("learning_path_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lpc_path_course_unique_idx" ON "learning_path_course" USING btree ("learning_path_id","course_id");--> statement-breakpoint
CREATE INDEX "learning_path_published_idx" ON "learning_path" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "ulp_user_id_idx" ON "user_learning_path" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ulp_user_path_unique_idx" ON "user_learning_path" USING btree ("user_id","learning_path_id");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_watch_time_user_date_idx" ON "daily_watch_time" USING btree ("user_id","record_date");--> statement-breakpoint
CREATE UNIQUE INDEX "point_tx_user_reason_ref_idx" ON "point_transaction" USING btree ("user_id","reason","reference_id");--> statement-breakpoint
CREATE INDEX "point_tx_user_created_idx" ON "point_transaction" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "submission_assignment_id_idx" ON "assignment_submission" USING btree ("assignment_id");--> statement-breakpoint
CREATE INDEX "submission_user_id_idx" ON "assignment_submission" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "submission_status_idx" ON "assignment_submission" USING btree ("status");--> statement-breakpoint
CREATE INDEX "assignment_course_id_idx" ON "assignment" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "assignment_lesson_id_idx" ON "assignment" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "course_request_course_id_idx" ON "course_request" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "course_request_user_id_idx" ON "course_request" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "course_request_status_idx" ON "course_request" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "certificate_user_course_idx" ON "certificate" USING btree ("user_id","course_id");--> statement-breakpoint
CREATE INDEX "answer_question_id_idx" ON "answer" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "assessment_skill_idx" ON "assessment" USING btree ("skill_id");--> statement-breakpoint
CREATE INDEX "chapter_course_id_idx" ON "chapter" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "course_like_course_id_idx" ON "course_like" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "course_tutor_id_idx" ON "course" USING btree ("tutor_id");--> statement-breakpoint
CREATE INDEX "course_status_idx" ON "course" USING btree ("status");--> statement-breakpoint
CREATE INDEX "lesson_chapter_id_idx" ON "lesson" USING btree ("chapter_id");--> statement-breakpoint
CREATE INDEX "mux_data_asset_id_idx" ON "mux_data" USING btree ("asset_id");--> statement-breakpoint
CREATE UNIQUE INDEX "purchase_user_course_idx" ON "purchase" USING btree ("user_id","course_id");--> statement-breakpoint
CREATE INDEX "purchase_course_id_idx" ON "purchase" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "question_lesson_id_idx" ON "question" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "question_user_id_idx" ON "question" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "quiz_question_lesson_id_idx" ON "quiz_question" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "review_course_id_idx" ON "review" USING btree ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "skill_dep_unique_idx" ON "skill_dependency" USING btree ("skill_id","prerequisite_skill_id");--> statement-breakpoint
CREATE INDEX "skill_dep_prereq_idx" ON "skill_dependency" USING btree ("prerequisite_skill_id");--> statement-breakpoint
CREATE INDEX "skill_category_idx" ON "skill" USING btree ("category");--> statement-breakpoint
CREATE INDEX "user_assessment_user_idx" ON "user_assessment_result" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_assessment_assessment_idx" ON "user_assessment_result" USING btree ("assessment_id");--> statement-breakpoint
CREATE INDEX "user_progress_lesson_id_idx" ON "user_progress" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "quiz_attempt_user_lesson_idx" ON "user_quiz_attempt" USING btree ("user_id","lesson_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_skill_unique_idx" ON "user_skill" USING btree ("user_id","skill_id");--> statement-breakpoint
CREATE INDEX "user_skill_skill_idx" ON "user_skill" USING btree ("skill_id");--> statement-breakpoint
CREATE INDEX "user_email_idx" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "user_role_status_idx" ON "user" USING btree ("role","status");--> statement-breakpoint
CREATE INDEX "user_paystack_idx" ON "user" USING btree ("paystack_customer_code");--> statement-breakpoint
ALTER TABLE "course" DROP COLUMN "is_published";