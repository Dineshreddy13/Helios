import { boolean, integer, pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { tasks } from "./task.model.js";

export const taskTodos = pgTable("task_todos", {
  id: uuid("id").defaultRandom().primaryKey(),
  taskId: uuid("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("task_todos_task_id_idx").on(t.taskId),
]);
