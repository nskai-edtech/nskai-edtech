ALTER TYPE "public"."role" ADD VALUE 'SCHOOL_ADMIN';--> statement-breakpoint
ALTER TYPE "public"."role" ADD VALUE 'TEACHER';--> statement-breakpoint
ALTER TYPE "public"."role" ADD VALUE 'STUDENT';--> statement-breakpoint
CREATE TABLE "dashboard_chat_conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text DEFAULT 'New Chat' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dashboard_chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"role" "chat_role" NOT NULL,
	"content" text NOT NULL,
	"order_index" serial NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "school_financials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"cac_registration_number" varchar(100),
	"tin" varchar(100),
	"settlement_bank_name" varchar(255),
	"account_number" varchar(50),
	"account_name" varchar(255),
	CONSTRAINT "school_financials_school_id_unique" UNIQUE("school_id")
);
--> statement-breakpoint
CREATE TABLE "school_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"reception_phone" varchar(50) NOT NULL,
	"full_address" text NOT NULL,
	"state" varchar(100) NOT NULL,
	"lga" varchar(100) NOT NULL,
	"website" varchar(255),
	CONSTRAINT "school_locations_school_id_unique" UNIQUE("school_id")
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"motto" text,
	"year_established" integer,
	"school_type" varchar(100) NOT NULL,
	"education_levels" jsonb,
	"logo_url" text,
	"primary_color" varchar(7),
	"curriculum_type" varchar(100),
	"owner_name" text NOT NULL,
	"owner_email" varchar(255) NOT NULL,
	"proprietor_name" text NOT NULL,
	"proprietor_email" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"name" text NOT NULL,
	"teacher_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"class_id" uuid,
	"fee_status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "students_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_super_admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "school_id" uuid;--> statement-breakpoint
ALTER TABLE "dashboard_chat_conversations" ADD CONSTRAINT "dashboard_chat_conversations_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboard_chat_messages" ADD CONSTRAINT "dashboard_chat_messages_conversation_id_dashboard_chat_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."dashboard_chat_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_financials" ADD CONSTRAINT "school_financials_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "school_locations" ADD CONSTRAINT "school_locations_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_teacher_id_user_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dashboard_chat_conv_user_id_idx" ON "dashboard_chat_conversations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "dashboard_chat_msg_conv_id_idx" ON "dashboard_chat_messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "dashboard_chat_msg_order_idx" ON "dashboard_chat_messages" USING btree ("conversation_id","order_index");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;