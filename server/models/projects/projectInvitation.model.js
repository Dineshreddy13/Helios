import { pgEnum, pgTable, timestamp, unique, uuid, index } from "drizzle-orm/pg-core";
import { users } from "../auth/user.model.js";
import { projects } from "./project.model.js";

export const projectInvitationStatusEnum = pgEnum("project_invitation_status", [
  "pending",
  "accepted",
  "rejected",
]);

export const projectInvitations = pgTable(
  "project_invitations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    invitedUserId: uuid("invited_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    invitedById: uuid("invited_by_id")
      .notNull()
      .references(() => users.id),
    status: projectInvitationStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique("project_invitations_project_user_unique").on(t.projectId, t.invitedUserId),
    index("project_invitations_project_id_idx").on(t.projectId),
    index("project_invitations_invited_user_id_idx").on(t.invitedUserId)
  ]
);
