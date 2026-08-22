import { integer, jsonb, pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { users } from "../auth/user.model.js";
import { lists } from "./list.model.js";
import { projects } from "./project.model.js";

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  listId: uuid("list_id")
    .notNull()
    .references(() => lists.id, { onDelete: "cascade" }),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").$type().notNull().default("pending"),
  tags: text("tags").array(),
  dueDate: timestamp("due_date", { withTimezone: true }),
  files: jsonb("files").$type(),
  position: integer("position").notNull(),
  assigneeId: uuid("assignee_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdById: uuid("created_by_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("tasks_list_id_idx").on(t.listId),
  index("tasks_project_id_idx").on(t.projectId)
]);
