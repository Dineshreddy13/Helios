CREATE INDEX "projects_owner_id_idx" ON "projects" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "project_members_project_id_idx" ON "project_members" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_members_user_id_idx" ON "project_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "project_invitations_project_id_idx" ON "project_invitations" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_invitations_invited_user_id_idx" ON "project_invitations" USING btree ("invited_user_id");--> statement-breakpoint
CREATE INDEX "lists_project_id_idx" ON "lists" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "tasks_list_id_idx" ON "tasks" USING btree ("list_id");--> statement-breakpoint
CREATE INDEX "tasks_project_id_idx" ON "tasks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "activity_logs_project_id_idx" ON "activity_logs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "activity_logs_actor_id_idx" ON "activity_logs" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "discussion_messages_project_id_idx" ON "discussion_messages" USING btree ("project_id");