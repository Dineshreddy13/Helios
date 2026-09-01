import { eq } from "drizzle-orm";
import { TASK_MSG } from "#config/constants.js";
import { db } from "#database/db.js";
import { tasks } from "#models/index.js";
import { logActivity } from "../../activity/services/activity.service.js";
import { ApiError } from "#utils/ApiError.js";
import { delCache } from "#utils/cache.js";
import { requireProjectMember } from "../../projects/utils/permissions.js";
import { deleteFiles } from "#utils/storage.js";

export const deleteTask = async (taskId, userId) => {
    const [existing] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, taskId))
        .limit(1);

    if (!existing) {
        throw new ApiError(404, TASK_MSG.NOT_FOUND);
    }

    await requireProjectMember(existing.projectId, userId);

    // Delete physical files from disk
    if (existing.files && Array.isArray(existing.files)) {
        deleteFiles(existing.files.map(f => f.url));
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

    await delCache(`tasks:project:${existing.projectId}`);

    return {
        message: TASK_MSG.DELETED,
        taskId,
        listId: existing.listId,
        projectId: existing.projectId,
    };
};
