import { max, eq } from "drizzle-orm";
import { LIST_MSG, TASK_MSG } from "#config/constants.js";
import { db } from "#database/db.js";
import { lists, tasks } from "#models/index.js";
import { logActivity } from "../../activity/services/activity.service.js";
import { ApiError } from "#utils/ApiError.js";
import { delCache } from "#utils/cache.js";
import { getMembership, requireProjectMember } from "../../projects/utils/permissions.js";
import { reminderQueue } from "#jobs/queues/reminder.queue.js";
import { assignee, buildTaskSelect } from "../utils/task.helpers.js";

export const createTask = async (listId, userId, { title, description, assigneeId, status, priority, tags, dueDate, reminderAt }) => {
    // 1. fetch the list to get projectId
    const [list] = await db
        .select()
        .from(lists)
        .where(eq(lists.id, listId))
        .limit(1);

    if (!list) {
        throw new ApiError(404, LIST_MSG.NOT_FOUND);
    }

    // 2. verify creator is a project member
    await requireProjectMember(list.projectId, userId);

    // 3. if assigneeId provided, verify assignee is a project member
    if (assigneeId) {
        const assigneeMembership = await getMembership(list.projectId, assigneeId);
        if (!assigneeMembership) {
            throw new ApiError(422, TASK_MSG.ASSIGNEE_NOT_MEMBER);
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
            status: status ?? "pending",
            priority: priority ?? "medium",
            tags: tags ?? null,
            dueDate: dueDate ? new Date(dueDate) : null,
            reminderAt: reminderAt ? new Date(reminderAt) : null,
            reminderSent: false,
            files: null,
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

    if (reminderAt) {
        const reminderDate = new Date(reminderAt);
        const delay = reminderDate.getTime() - Date.now();
        if (delay > 0) {
            await reminderQueue.add(
                "task-reminder",
                { taskId: inserted.id },
                {
                    delay,
                    jobId: `reminder-${inserted.id}-${reminderDate.getTime()}`,
                }
            );
        }
    }

    await delCache(`tasks:project:${list.projectId}`);

    return { task, message: TASK_MSG.CREATED };
};
