import { and, eq, gt, gte, lt, lte, sql } from "drizzle-orm";
import { TASK_MSG } from "#config/constants.js";
import { db } from "#database/db.js";
import { lists, tasks } from "#models/index.js";
import { logActivity } from "../../activity/services/activity.service.js";
import { ApiError } from "#utils/ApiError.js";
import { delCache } from "#utils/cache.js";
import { requireProjectMember } from "../../projects/utils/permissions.js";
import { assignee, buildTaskSelect, reindexList } from "../utils/task.helpers.js";

export const moveTask = async (taskId, userId, { targetListId, targetPosition }) => {
    // 1. fetch task
    const [existing] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, taskId))
        .limit(1);

    if (!existing) {
        throw new ApiError(404, TASK_MSG.NOT_FOUND);
    }

    // 2. verify membership
    await requireProjectMember(existing.projectId, userId);

    // 3. verify targetList belongs to the same project
    const [targetList] = await db
        .select()
        .from(lists)
        .where(eq(lists.id, targetListId))
        .limit(1);

    if (!targetList || targetList.projectId !== existing.projectId) {
        throw new ApiError(400, TASK_MSG.TARGET_LIST_NOT_IN_PROJECT);
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

    await delCache(`tasks:project:${existing.projectId}`);

    return {
        message: TASK_MSG.MOVED,
        task,
        sourceListId,
        targetListId,
    };
};
