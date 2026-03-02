CREATE TYPE "public"."chat_role" AS ENUM('user', 'ai');--> statement-breakpoint
ALTER TYPE "public"."course_status" ADD VALUE 'ARCHIVED';--> statement-breakpoint
ALTER TYPE "public"."point_reason" ADD VALUE 'DIAGNOSTIC_COMPLETED';--> statement-breakpoint
ALTER TYPE "public"."point_reason" ADD VALUE 'SKILL_MASTERED';--> statement-breakpoint
CREATE TABLE "course_skill" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_chat_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"role" "chat_role" NOT NULL,
	"content" text NOT NULL,
	"order_index" serial NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "diagnostic_completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "course_skill" ADD CONSTRAINT "course_skill_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_skill" ADD CONSTRAINT "course_skill_skill_id_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_chat_conversations" ADD CONSTRAINT "ai_chat_conversations_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_chat_conversations" ADD CONSTRAINT "ai_chat_conversations_lesson_id_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_chat_messages" ADD CONSTRAINT "ai_chat_messages_conversation_id_ai_chat_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."ai_chat_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "course_skill_unique_idx" ON "course_skill" USING btree ("course_id","skill_id");--> statement-breakpoint
CREATE INDEX "course_skill_skill_idx" ON "course_skill" USING btree ("skill_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ai_chat_conv_user_lesson_idx" ON "ai_chat_conversations" USING btree ("user_id","lesson_id");--> statement-breakpoint
CREATE INDEX "ai_chat_conv_user_id_idx" ON "ai_chat_conversations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_chat_conv_lesson_id_idx" ON "ai_chat_conversations" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "ai_chat_msg_conv_id_idx" ON "ai_chat_messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "ai_chat_msg_order_idx" ON "ai_chat_messages" USING btree ("conversation_id","order_index");