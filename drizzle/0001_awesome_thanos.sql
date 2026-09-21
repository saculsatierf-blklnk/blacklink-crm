ALTER TABLE "leads" ADD COLUMN "cadence_state" jsonb DEFAULT '{"completedSteps":[]}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "notes" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "script_version" varchar(50) DEFAULT 'v1_direct' NOT NULL;