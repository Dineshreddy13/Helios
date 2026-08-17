import { alias } from "drizzle-orm/pg-core";
import { and, asc, eq, gt, gte, lt, lte, max, sql } from "drizzle-orm";
import { LIST_MSG, PROJECT_MSG, TASK_MSG } from "../../config/constants.js";
import { db } from "../../database/db.js";
import { lists, projectMembers, tasks, users } from "../../models/index.js";
import { logActivity } from "../activity/activity.service.js";

// ── helpers ────────────────────────────────────────────────────────────────

const getMembership = async (projectId, userId) => {
    const [row] = await db
        .select({ role: projectMembers.role })
        .from(projectMembers)
        .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
        .limit(1);
    return row ?? null;
};

// Aliased assignee table so we can join users twice if needed in the future
const assignee = alias(users, "assignee");

// Build a single task row with nested assignee info (null when unassigned)
const buildTaskSelect = () => ({
    id: tasks.id,
    listId: tasks.listId,
    projectId: tasks.projectId,
    title: tasks.title,
    description: tasks.description,
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
const reindexList = async (tx, listId) => {
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

// ── createTask ─────────────────────────────────────────────────────────────
export const createTask = async (listId, userId, { title, description, assigneeId }) => {
    // 1. fetch the list to get projectId
    const [list] = await db
        .select()
        .from(lists)
        .where(eq(lists.id, listId))
        .limit(1);

    if (!list) {
        return { status: 404, message: LIST_MSG.NOT_FOUND };
    }

    // 2. verify creator is a project member
    const membership = await getMembership(list.projectId, userId);
    if (!membership) {
        return { status: 403, message: PROJECT_MSG.NOT_MEMBER };
    }

    // 3. if assigneeId provided, verify assignee is a project member
    if (assigneeId) {
        const assigneeMembership = await getMembership(list.projectId, assigneeId);
        if (!assigneeMembership) {
            return { status: 422, message: TASK_MSG.ASSIGNEE_NOT_MEMBER };
        }
    }

    // 4. compute next position
    const [{ maxPosition }] = await db
        .select({ maxPosition: max(tasks.position) })
        .from(tasks)
        .where(eq(tasks.listId, listId));

    const position = maxPosition !== null ? maxPosition + 1 : 0;

    // 5. insert
    const [inserted] = await db
        .insert(tasks)
        .values({
            listId,
            projectId: list.projectId,
            title,
            description,
            position,
            assigneeId: assigneeId ?? null,
            createdById: userId,
        })
        .returning();

    // 6. return with assignee info joined
    const [task] = await db
        .select(buildTaskSelect())
        .from(tasks)
        .leftJoin(assignee, eq(tasks.assigneeId, assignee.id))
        .where(eq(tasks.id, inserted.id))
        .limit(1);

    await logActivity({
        projectId: list.projectId,
        actorId: userId,
        actionType: "task.created",
        targetType: "task",
        targetId: inserted.id,
        metadata: { taskTitle: title },
    });

    return { status: 201, message: TASK_MSG.CREATED, task };
};

// ── getTasksForProject ─────────────────────────────────────────────────────
export const getTasksForProject = async (projectId, userId) => {
    const membership = await getMembership(projectId, userId);
    if (!membership) {
        return { status: 403, message: PROJECT_MSG.NOT_MEMBER };
    }

    const rows = await db
        .select(buildTaskSelect())
        .from(tasks)
        .leftJoin(assignee, eq(tasks.assigneeId, assignee.id))
        .where(eq(tasks.projectId, projectId))
        .orderBy(asc(tasks.listId), asc(tasks.position));

    return { status: 200, tasks: rows };
};

// ── updateTask ─────────────────────────────────────────────────────────────
export const updateTask = async (taskId, userId, { title, description, assigneeId }) => {
    // 1. fetch task
    const [existing] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, taskId))
        .limit(1);

    if (!existing) {
        return { status: 404, message: TASK_MSG.NOT_FOUND };
    }

    // 2. verify membership
    const membership = await getMembership(existing.projectId, userId);
    if (!membership) {
        return { status: 403, message: PROJECT_MSG.NOT_MEMBER };
    }

    // 3. if assigneeId provided (and not explicitly set to null), verify assignee is a member
    if (assigneeId) {
        const assigneeMembership = await getMembership(existing.projectId, assigneeId);
        if (!assigneeMembership) {
            return { status: 422, message: TASK_MSG.ASSIGNEE_NOT_MEMBER };
        }
    }

    // 4. build update payload — only include defined keys
    const patch = { updatedAt: new Date() };
    if (title !== undefined) patch.title = title;
    if (description !== undefined) patch.description = description;
    if (assigneeId !== undefined) patch.assigneeId = assigneeId; // allows null to unassign

    await db.update(tasks).set(patch).where(eq(tasks.id, taskId));

    // 5. return with assignee info joined
    const [task] = await db
        .select(buildTaskSelect())
        .from(tasks)
        .leftJoin(assignee, eq(tasks.assigneeId, assignee.id))
        .where(eq(tasks.id, taskId))
        .limit(1);

    // Build list of changed fields for metadata
    const changedFields = [];
    if (title !== undefined && title !== existing.title) changedFields.push("title");
    if (description !== undefined && description !== existing.description) changedFields.push("description");
    if (assigneeId !== undefined && assigneeId !== existing.assigneeId) changedFields.push("assignee");

    await logActivity({
        projectId: existing.projectId,
        actorId: userId,
        actionType: "task.updated",
        targetType: "task",
        targetId: taskId,
        metadata: { taskTitle: task.title, changedFields },
    });

    return { status: 200, message: TASK_MSG.UPDATED, task };
};

// ── deleteTask ─────────────────────────────────────────────────────────────
export const deleteTask = async (taskId, userId) => {
    const [existing] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, taskId))
        .limit(1);

    if (!existing) {
        return { status: 404, message: TASK_MSG.NOT_FOUND };
    }

    const membership = await getMembership(existing.projectId, userId);
    if (!membership) {
        return { status: 403, message: PROJECT_MSG.NOT_MEMBER };
    }

    await db.delete(tasks).where(eq(tasks.id, taskId));

    await logActivity({
        projectId: existing.projectId,
        actorId: userId,
        actionType: "task.deleted",
        targetType: "task",
        targetId: taskId,
        metadata: { taskTitle: existing.title },
    });

    return {
        status: 200,
        message: TASK_MSG.DELETED,
        taskId,
        listId: existing.listId,
        projectId: existing.projectId,
    };
};

// ── moveTask ───────────────────────────────────────────────────────────────
export const moveTask = async (taskId, userId, { targetListId, targetPosition }) => {
    // 1. fetch task
    const [existing] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, taskId))
        .limit(1);

    if (!existing) {
        return { status: 404, message: TASK_MSG.NOT_FOUND };
    }

    // 2. verify membership
    const membership = await getMembership(existing.projectId, userId);
    if (!membership) {
        return { status: 403, message: PROJECT_MSG.NOT_MEMBER };
    }

    // 3. verify targetList belongs to the same project
    const [targetList] = await db
        .select()
        .from(lists)
        .where(eq(lists.id, targetListId))
        .limit(1);

    if (!targetList || targetList.projectId !== existing.projectId) {
        return { status: 400, message: TASK_MSG.TARGET_LIST_NOT_IN_PROJECT };
    }

    const sourceListId = existing.listId;
    const oldPosition = existing.position;
    const isSameList = sourceListId === targetListId;

    await db.transaction(async (tx) => {
        if (isSameList) {
            // ── within-list reorder ──────────────────────────────────────
            // Temporarily set the moving task's position out of range to
            // avoid unique-constraint conflicts while shifting neighbours.
            await tx
                .update(tasks)
                .set({ position: -1, updatedAt: new Date() })
                .where(eq(tasks.id, taskId));

            if (targetPosition < oldPosition) {
                // Moving up: shift tasks between [targetPosition, oldPosition) down by 1
                await tx
                    .update(tasks)
                    .set({ position: sql`${tasks.position} + 1`, updatedAt: new Date() })
                    .where(
                        and(
                            eq(tasks.listId, sourceListId),
                            gte(tasks.position, targetPosition),
                            lt(tasks.position, oldPosition)
                        )
                    );
            } else {
                // Moving down: shift tasks between (oldPosition, targetPosition] up by -1
                await tx
                    .update(tasks)
                    .set({ position: sql`${tasks.position} - 1`, updatedAt: new Date() })
                    .where(
                        and(
                            eq(tasks.listId, sourceListId),
                            gt(tasks.position, oldPosition),
                            lte(tasks.position, targetPosition)
                        )
                    );
            }

            // Place the task at its final position
            await tx
                .update(tasks)
                .set({ position: targetPosition, updatedAt: new Date() })
                .where(eq(tasks.id, taskId));

            // Full re-index to close any edge-case gaps (matches reorderLists approach)
            await reindexList(tx, sourceListId);
        } else {
            // ── cross-list move ──────────────────────────────────────────
            // a) remove from source list: detach by giving it an out-of-range sentinel
            await tx
                .update(tasks)
                .set({ position: -1, updatedAt: new Date() })
                .where(eq(tasks.id, taskId));

            // b) re-index source list to close the gap
            await reindexList(tx, sourceListId);

            // c) make room in target list: shift tasks at >= targetPosition down by 1
            await tx
                .update(tasks)
                .set({ position: sql`${tasks.position} + 1`, updatedAt: new Date() })
                .where(
                    and(
                        eq(tasks.listId, targetListId),
                        gte(tasks.position, targetPosition)
                    )
                );

            // d) move task to new list at targetPosition
            await tx
                .update(tasks)
                .set({
                    listId: targetListId,
                    position: targetPosition,
                    updatedAt: new Date(),
                })
                .where(eq(tasks.id, taskId));

            // e) re-index target list for full contiguity
            await reindexList(tx, targetListId);
        }
    });

    // Return updated task with assignee info
    const [task] = await db
        .select(buildTaskSelect())
        .from(tasks)
        .leftJoin(assignee, eq(tasks.assigneeId, assignee.id))
        .where(eq(tasks.id, taskId))
        .limit(1);

    // Fetch list names for the activity log
    const [sourceList] = await db
        .select({ name: lists.name })
        .from(lists)
        .where(eq(lists.id, sourceListId))
        .limit(1);
    const [destList] = await db
        .select({ name: lists.name })
        .from(lists)
        .where(eq(lists.id, targetListId))
        .limit(1);

    await logActivity({
        projectId: existing.projectId,
        actorId: userId,
        actionType: "task.moved",
        targetType: "task",
        targetId: taskId,
        metadata: {
            taskTitle: existing.title,
            fromListName: sourceList?.name ?? "Unknown",
            toListName: destList?.name ?? "Unknown",
        },
    });

    return {
        status: 200,
        message: TASK_MSG.MOVED,
        task,
        sourceListId,
        targetListId,
    };
};
