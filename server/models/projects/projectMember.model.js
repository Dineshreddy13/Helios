import { pgEnum, pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { users } from "../auth/user.model.js";
import { projects } from "./project.model.js";

export const projectMemberRoleEnum = pgEnum("project_member_role", [
  "owner",
  "member",
]);

export const projectMembers = pgTable(
  "project_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: projectMemberRoleEnum("role").notNull().default("member"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("project_members_project_user_unique").on(t.projectId, t.userId)]
);
