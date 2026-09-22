ALTER TABLE "leads" ADD COLUMN "next_activity_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "next_activity_type" varchar(50);