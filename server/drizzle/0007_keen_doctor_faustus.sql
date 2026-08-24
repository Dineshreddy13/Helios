ALTER TABLE "tasks" ADD COLUMN "reminder_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "reminder_sent" boolean DEFAULT false NOT NULL;