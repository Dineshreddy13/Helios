import { pgTable, text, timestamp, uuid, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { users } from "../auth/user.model.js";
import { projects } from "../projects/project.model.js";

export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  actorId: uuid("actor_id").references(() => users.id, {
    onDelete: "set null",
  }),
  actionType: varchar("action_type").notNull(),
  targetType: varchar("target_type").notNull(),
  targetId: uuid("target_id"),
  metadata: jsonb("metadata"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("activity_logs_project_id_idx").on(t.projectId),
  index("activity_logs_actor_id_idx").on(t.actorId)
]);
