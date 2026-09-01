import { eq } from "drizzle-orm";
import { TASK_MSG } from "#config/constants.js";
import { db } from "#database/db.js";
import { tasks } from "#models/index.js";
import { logActivity } from "../../activity/services/activity.service.js";
import { ApiError } from "#utils/ApiError.js";
import { delCache } from "#utils/cache.js";
import { getMembership, requireProjectMember } from "../../projects/utils/permissions.js";
import { reminderQueue } from "#jobs/queues/reminder.queue.js";
import { assignee, buildTaskSelect } from "../utils/task.helpers.js";

export const updateTask = async (taskId, userId, { title, description, assigneeId, status, priority, tags, dueDate, reminderAt }) => {
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

    // 3. if assigneeId provided (and not explicitly set to null), verify assignee is a member
    if (assigneeId) {
        const assigneeMembership = await getMembership(existing.projectId, assigneeId);
        if (!assigneeMembership) {
            throw new ApiError(422, TASK_MSG.ASSIGNEE_NOT_MEMBER);
        }
    }

    // 4. build update payload — only include defined keys
    const patch = { updatedAt: new Date() };
    if (title !== undefined) patch.title = title;
    if (description !== undefined) patch.description = description;
    if (assigneeId !== undefined) patch.assigneeId = assigneeId; // allows null to unassign
    if (status !== undefined) patch.status = status;
    if (priority !== undefined) patch.priority = priority;
    if (tags !== undefined) patch.tags = tags;
    if (dueDate !== undefined) patch.dueDate = dueDate !== null ? new Date(dueDate) : null;
    if (reminderAt !== undefined) {
        patch.reminderAt = reminderAt !== null ? new Date(reminderAt) : null;
        patch.reminderSent = false;
    }

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
    if (status !== undefined && status !== existing.status) changedFields.push("status");
    if (priority !== undefined && priority !== existing.priority) changedFields.push("priority");
    if (tags !== undefined) changedFields.push("tags");
    if (dueDate !== undefined) changedFields.push("dueDate");
    if (reminderAt !== undefined) changedFields.push("reminderAt");

    await logActivity({
        projectId: existing.projectId,
        actorId: userId,
        actionType: "task.updated",
        targetType: "task",
        targetId: taskId,
        metadata: { taskTitle: task.title, changedFields },
    });

    if (reminderAt !== undefined && reminderAt !== null) {
        const reminderDate = new Date(reminderAt);
        const delay = reminderDate.getTime() - Date.now();
        if (delay > 0) {
            await reminderQueue.add(
                "task-reminder",
                { taskId: existing.id },
                {
                    delay,
                    jobId: `reminder-${existing.id}-${reminderDate.getTime()}`,
                }
            );
        }
    }

    await delCache(`tasks:project:${existing.projectId}`);

    return { task, message: TASK_MSG.UPDATED };
};
