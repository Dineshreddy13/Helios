import { relations } from "drizzle-orm";
import { projects } from "./projects/project.model.js";
import { projectMembers } from "./projects/projectMember.model.js";
import { projectInvitations } from "./projects/projectInvitation.model.js";
import { lists } from "./lists/list.model.js";
import { tasks } from "./tasks/task.model.js";
import { activityLogs } from "./activity/activityLog.model.js";
import { discussionMessages } from "./discussions/discussionMessage.model.js";
import { users } from "./auth/user.model.js";

// ── users ──────────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  ownedProjects: many(projects, { relationName: "project_owner" }),
  projectMemberships: many(projectMembers, { relationName: "member_user" }),
  sentInvitations: many(projectInvitations, { relationName: "invitation_inviter" }),
  receivedInvitations: many(projectInvitations, { relationName: "invitation_invitee" }),
  assignedTasks: many(tasks, { relationName: "task_assignee" }),
  createdTasks: many(tasks, { relationName: "task_creator" }),
  activityLogs: many(activityLogs, { relationName: "activity_actor" }),
  discussionMessages: many(discussionMessages, { relationName: "message_sender" }),
}));

// ── projects ───────────────────────────────────────────────────────────────
export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
    relationName: "project_owner",
  }),
  members: many(projectMembers, { relationName: "project_members" }),
  invitations: many(projectInvitations, { relationName: "project_invitations" }),
  lists: many(lists, { relationName: "project_lists" }),
  activityLogs: many(activityLogs, { relationName: "activity_project" }),
  discussionMessages: many(discussionMessages, { relationName: "message_project" }),
}));

// ── project_members ────────────────────────────────────────────────────────
export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
    relationName: "project_members",
  }),
  user: one(users, {
    fields: [projectMembers.userId],
    references: [users.id],
    relationName: "member_user",
  }),
}));

// ── project_invitations ────────────────────────────────────────────────────
export const projectInvitationsRelations = relations(projectInvitations, ({ one }) => ({
  project: one(projects, {
    fields: [projectInvitations.projectId],
    references: [projects.id],
    relationName: "project_invitations",
  }),
  invitedUser: one(users, {
    fields: [projectInvitations.invitedUserId],
    references: [users.id],
    relationName: "invitation_invitee",
  }),
  invitedBy: one(users, {
    fields: [projectInvitations.invitedById],
    references: [users.id],
    relationName: "invitation_inviter",
  }),
}));

// ── lists ──────────────────────────────────────────────────────────────────
export const listsRelations = relations(lists, ({ one, many }) => ({
  project: one(projects, {
    fields: [lists.projectId],
    references: [projects.id],
    relationName: "project_lists",
  }),
  tasks: many(tasks, { relationName: "list_tasks" }),
}));

// ── tasks ──────────────────────────────────────────────────────────────────
export const tasksRelations = relations(tasks, ({ one }) => ({
  list: one(lists, {
    fields: [tasks.listId],
    references: [lists.id],
    relationName: "list_tasks",
  }),
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
    relationName: "task_project",
  }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
    relationName: "task_assignee",
  }),
  createdBy: one(users, {
    fields: [tasks.createdById],
    references: [users.id],
    relationName: "task_creator",
  }),
}));

// ── activity_logs ─────────────────────────────────────────────────────────
export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  project: one(projects, {
    fields: [activityLogs.projectId],
    references: [projects.id],
    relationName: "activity_project",
  }),
  actor: one(users, {
    fields: [activityLogs.actorId],
    references: [users.id],
    relationName: "activity_actor",
  }),
}));

// ── discussion_messages ───────────────────────────────────────────────────
export const discussionMessagesRelations = relations(discussionMessages, ({ one }) => ({
  project: one(projects, {
    fields: [discussionMessages.projectId],
    references: [projects.id],
    relationName: "message_project",
  }),
  sender: one(users, {
    fields: [discussionMessages.senderId],
    references: [users.id],
    relationName: "message_sender",
  }),
}));
