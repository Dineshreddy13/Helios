import { boolean, pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { users } from "../auth/user.model.js";
import { projects } from "./project.model.js";

export const discussionMessages = pgTable("discussion_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isEdited: boolean("is_edited").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("discussion_messages_project_id_idx").on(t.projectId)
]);
