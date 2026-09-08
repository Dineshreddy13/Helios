import { pgTable, uuid, timestamp, unique, index } from "drizzle-orm/pg-core";
import { tasks } from "./task.model.js";

export const taskDependencies = pgTable("task_dependencies", {
  id: uuid("id").defaultRandom().primaryKey(),
  blockingTaskId: uuid("blocking_task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  blockedTaskId: uuid("blocked_task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  unique("task_dep_unique").on(t.blockingTaskId, t.blockedTaskId),
  index("task_dep_blocking_idx").on(t.blockingTaskId),
  index("task_dep_blocked_idx").on(t.blockedTaskId),
]);
