import { asc, eq } from "drizzle-orm";
import { db } from "#database/db.js";
import { tasks } from "#models/index.js";
import { getCache, setCache } from "#utils/cache.js";
import { requireProjectMember } from "../../projects/utils/permissions.js";
import { assignee, buildTaskSelect } from "../utils/task.helpers.js";

export const getTasksForProject = async (projectId, userId) => {
    await requireProjectMember(projectId, userId);

    const cacheKey = `tasks:project:${projectId}`;
    const cached = await getCache(cacheKey);
    if (cached) {
        return { tasks: cached };
    }

    const rows = await db
        .select(buildTaskSelect())
        .from(tasks)
        .leftJoin(assignee, eq(tasks.assigneeId, assignee.id))
        .where(eq(tasks.projectId, projectId))
        .orderBy(asc(tasks.listId), asc(tasks.position));

    await setCache(cacheKey, rows);
    return { tasks: rows };
};
