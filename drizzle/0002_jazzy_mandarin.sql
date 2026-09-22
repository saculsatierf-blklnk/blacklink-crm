CREATE TABLE "deal_telemetry_embeddings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"content_type" varchar(50) NOT NULL,
	"raw_content" text NOT NULL,
	"embedding" vector(1536),
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "deal_score" integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "telemetry_events" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "deal_telemetry_embeddings" ADD CONSTRAINT "deal_telemetry_embeddings_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;