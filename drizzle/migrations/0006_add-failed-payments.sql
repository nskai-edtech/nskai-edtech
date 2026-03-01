CREATE TABLE "failed_payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"user_id" uuid,
	"course_id" text,
	"path_id" text,
	"paystack_reference" text NOT NULL,
	"amount" integer DEFAULT 0 NOT NULL,
	"reason" text,
	"paystack_event" text NOT NULL,
	"raw_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "failed_payment" ADD CONSTRAINT "failed_payment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "failed_payment_email_idx" ON "failed_payment" USING btree ("email");--> statement-breakpoint
CREATE INDEX "failed_payment_user_idx" ON "failed_payment" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "failed_payment_ref_idx" ON "failed_payment" USING btree ("paystack_reference");--> statement-breakpoint
CREATE INDEX "answer_user_id_idx" ON "answer" USING btree ("user_id");