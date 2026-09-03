import { eq, and } from "drizzle-orm";
import { TASK_MSG } from "#config/constants.js";
import { db } from "#database/db.js";
import { tasks, taskDependencies } from "#models/index.js";
import { ApiError } from "#utils/ApiError.js";
import { delCache } from "#utils/cache.js";
import { requireProjectMember } from "../../projects/utils/permissions.js";

/**
 * BFS-based cycle detection.
 *
 * We are about to add the edge: blockingTaskId → blockedTaskId.
 * A cycle exists if blockedTaskId can already reach blockingTaskId
 * through existing edges. Since edges go blocking → blocked,
 * we start at blockedTaskId and follow outgoing "blocking" edges
 * (where it acts as the blocking_task_id) to see if we reach blockingTaskId.
 */
const wouldCreateCycle = async (blockingTaskId, blockedTaskId) => {
    const visited = new Set();
    const queue = [blockedTaskId];

    while (queue.length > 0) {
        const current = queue.shift();

        if (current === blockingTaskId) {
            return true; // cycle detected
        }

        if (visited.has(current)) continue;
        visited.add(current);

        // Find all tasks that `current` blocks (current is the blocking task)
        const edges = await db
            .select({ blockedId: taskDependencies.blockedTaskId })
            .from(taskDependencies)
            .where(eq(taskDependencies.blockingTaskId, current));

        for (const edge of edges) {
            if (!visited.has(edge.blockedId)) {
                queue.push(edge.blockedId);
            }
        }
    }

    return false;
};

export const addDependency = async (taskId, userId, { blockingTaskId }) => {
    // 1. Self-dependency check
    if (taskId === blockingTaskId) {
        throw new ApiError(400, TASK_MSG.DEPENDENCY_SELF);
    }

    // 2. Fetch both tasks
    const [blockedTask] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, taskId))
        .limit(1);

    if (!blockedTask) {
        throw new ApiError(404, TASK_MSG.NOT_FOUND);
    }

    const [blockingTask] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, blockingTaskId))
        .limit(1);

    if (!blockingTask) {
        throw new ApiError(404, TASK_MSG.NOT_FOUND);
    }

    // 3. Cross-project check
    if (blockedTask.projectId !== blockingTask.projectId) {
        throw new ApiError(400, TASK_MSG.DEPENDENCY_CROSS_PROJECT);
    }

    // 4. Verify membership
    await requireProjectMember(blockedTask.projectId, userId);

    // 5. Duplicate check
    const [existing] = await db
        .select()
        .from(taskDependencies)
        .where(
            and(
                eq(taskDependencies.blockingTaskId, blockingTaskId),
                eq(taskDependencies.blockedTaskId, taskId)
            )
        )
        .limit(1);

    if (existing) {
        throw new ApiError(409, TASK_MSG.DEPENDENCY_DUPLICATE);
    }

    // 6. Cycle detection (BFS)
    const cycleDetected = await wouldCreateCycle(blockingTaskId, taskId);
    if (cycleDetected) {
        throw new ApiError(409, TASK_MSG.DEPENDENCY_CYCLE);
    }

    // 7. Insert dependency
    const [dependency] = await db
        .insert(taskDependencies)
        .values({
            blockingTaskId,
            blockedTaskId: taskId,
        })
        .returning();

    // 8. Invalidate cache
    await delCache(`tasks:project:${blockedTask.projectId}`);

    return { dependency, message: TASK_MSG.DEPENDENCY_ADDED };
};

export const removeDependency = async (taskId, userId, blockingTaskId) => {
    // 1. Fetch the blocked task
    const [blockedTask] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, taskId))
        .limit(1);

    if (!blockedTask) {
        throw new ApiError(404, TASK_MSG.NOT_FOUND);
    }

    // 2. Verify membership
    await requireProjectMember(blockedTask.projectId, userId);

    // 3. Find and delete the dependency
    const [deleted] = await db
        .delete(taskDependencies)
        .where(
            and(
                eq(taskDependencies.blockingTaskId, blockingTaskId),
                eq(taskDependencies.blockedTaskId, taskId)
            )
        )
        .returning();

    if (!deleted) {
        throw new ApiError(404, TASK_MSG.DEPENDENCY_NOT_FOUND);
    }

    // 4. Invalidate cache
    await delCache(`tasks:project:${blockedTask.projectId}`);

    return { message: TASK_MSG.DEPENDENCY_REMOVED };
};

export const getDependencies = async (taskId, userId) => {
    // 1. Fetch the task
    const [task] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, taskId))
        .limit(1);

    if (!task) {
        throw new ApiError(404, TASK_MSG.NOT_FOUND);
    }

    // 2. Verify membership
    await requireProjectMember(task.projectId, userId);

    // 3. Query blocking tasks with their info
    const dependencies = await db
        .select({
            id: taskDependencies.id,
            blockingTaskId: taskDependencies.blockingTaskId,
            blockedTaskId: taskDependencies.blockedTaskId,
            createdAt: taskDependencies.createdAt,
            blockingTask: {
                id: tasks.id,
                title: tasks.title,
                status: tasks.status,
                priority: tasks.priority,
                listId: tasks.listId,
            },
        })
        .from(taskDependencies)
        .innerJoin(tasks, eq(taskDependencies.blockingTaskId, tasks.id))
        .where(eq(taskDependencies.blockedTaskId, taskId));

    return { dependencies };
};
