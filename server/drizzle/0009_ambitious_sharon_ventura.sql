CREATE TABLE "task_dependencies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"blocking_task_id" uuid NOT NULL,
	"blocked_task_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "task_dep_unique" UNIQUE("blocking_task_id","blocked_task_id")
);
--> statement-breakpoint
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_blocking_task_id_tasks_id_fk" FOREIGN KEY ("blocking_task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_blocked_task_id_tasks_id_fk" FOREIGN KEY ("blocked_task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "task_dep_blocking_idx" ON "task_dependencies" USING btree ("blocking_task_id");--> statement-breakpoint
CREATE INDEX "task_dep_blocked_idx" ON "task_dependencies" USING btree ("blocked_task_id");