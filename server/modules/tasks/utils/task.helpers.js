import { alias } from "drizzle-orm/pg-core";
import { asc, eq } from "drizzle-orm";
import { tasks, users } from "#models/index.js";

// Aliased assignee table so we can join users twice if needed in the future
export const assignee = alias(users, "assignee");

// Build a single task row with nested assignee info (null when unassigned)
export const buildTaskSelect = () => ({
    id: tasks.id,
    listId: tasks.listId,
    projectId: tasks.projectId,
    title: tasks.title,
    description: tasks.description,
    status: tasks.status,
    priority: tasks.priority,
    tags: tasks.tags,
    dueDate: tasks.dueDate,
    reminderAt: tasks.reminderAt,
    reminderSent: tasks.reminderSent,
    files: tasks.files,
    position: tasks.position,
    createdById: tasks.createdById,
    createdAt: tasks.createdAt,
    updatedAt: tasks.updatedAt,
    assignee: {
        id: assignee.id,
        username: assignee.username,
        email: assignee.email,
        avatarUrl: assignee.avatarUrl,
    },
});

// Re-index all tasks in a list by their current position order.
// Closes gaps and makes positions contiguous starting from 0.
export const reindexList = async (tx, listId) => {
    const rows = await tx
        .select({ id: tasks.id })
        .from(tasks)
        .where(eq(tasks.listId, listId))
        .orderBy(asc(tasks.position));

    const updates = rows.map(({ id }, index) =>
        tx
            .update(tasks)
            .set({ position: index, updatedAt: new Date() })
            .where(eq(tasks.id, id))
    );
    await Promise.all(updates);
};
