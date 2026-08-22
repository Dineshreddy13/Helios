import { and, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { PROJECT_MSG } from "../../config/constants.js";
import { db } from "../../database/db.js";
import {
    activityLogs,
    projectMembers,
    projects,
    users,
} from "../../models/index.js";
import { getIO } from "../../sockets/index.js";
import { ApiError } from "../../utils/ApiError.js";
import { requireProjectMember } from "../../utils/permissions.js";

// ── helpers ────────────────────────────────────────────────────────────────

const actor = alias(users, "actor");

// Build a human-readable message from the actionType and metadata.
const buildMessage = (actionType, metadata = {}) => {
    const actorName = metadata.actorName ?? "Someone";

    switch (actionType) {
        case "project.created":
            return `${actorName} created this project`;
        case "list.created":
            return `${actorName} created list "${metadata.listName}"`;
        case "list.updated":
            return `${actorName} renamed list "${metadata.oldName}" to "${metadata.newName}"`;
        case "list.deleted":
            return `${actorName} deleted list "${metadata.listName}"`;
        case "task.created":
            return `${actorName} created task "${metadata.taskTitle}"`;
        case "task.updated":
            return `${actorName} updated task "${metadata.taskTitle}"`;
        case "task.deleted":
            return `${actorName} deleted task "${metadata.taskTitle}"`;
        case "task.moved":
            return `${actorName} moved "${metadata.taskTitle}" from ${metadata.fromListName} to ${metadata.toListName}`;
        case "invitation.sent":
            return `${actorName} invited ${metadata.invitedUserName}`;
        case "invitation.accepted":
            return `${actorName} accepted the invitation`;
        case "invitation.rejected":
            return `${actorName} rejected the invitation`;
        default:
            return `${actorName} performed ${actionType}`;
    }
};

// Look up a user's username by id
const getActorName = async (userId, txOrDb = db) => {
    if (!userId) return "Someone";
    const [row] = await txOrDb
        .select({ username: users.username })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
    return row?.username ?? "Someone";
};

// ── logActivity ────────────────────────────────────────────────────────────
export const logActivity = async (
    { projectId, actorId, actionType, targetType, targetId, metadata = {} },
    tx
) => {
    const executor = tx ?? db;

    // Resolve actor name if not already provided in metadata
    if (!metadata.actorName) {
        metadata.actorName = await getActorName(actorId, executor);
    }

    const message = buildMessage(actionType, metadata);

    const [log] = await executor
        .insert(activityLogs)
        .values({
            projectId,
            actorId: actorId ?? null,
            actionType,
            targetType,
            targetId: targetId ?? null,
            metadata,
            message,
        })
        .returning();

    getIO().to(`project:${projectId}`).emit("activity:created", log);

    return log;
};

// ── getProjectActivity ─────────────────────────────────────────────────────
export const getProjectActivity = async (projectId, userId, { limit = 20, offset = 0 } = {}) => {
    await requireProjectMember(projectId, userId);

    const rows = await db
        .select({
            id: activityLogs.id,
            projectId: activityLogs.projectId,
            actionType: activityLogs.actionType,
            targetType: activityLogs.targetType,
            targetId: activityLogs.targetId,
            metadata: activityLogs.metadata,
            message: activityLogs.message,
            createdAt: activityLogs.createdAt,
            actor: {
                id: actor.id,
                username: actor.username,
                avatarUrl: actor.avatarUrl,
            },
        })
        .from(activityLogs)
        .leftJoin(actor, eq(activityLogs.actorId, actor.id))
        .where(eq(activityLogs.projectId, projectId))
        .orderBy(desc(activityLogs.createdAt))
        .limit(limit)
        .offset(offset);

    return rows;
};

// ── getDashboardActivity ───────────────────────────────────────────────────
export const getDashboardActivity = async (userId, { limit = 30 } = {}) => {
    const rows = await db
        .select({
            id: activityLogs.id,
            projectId: activityLogs.projectId,
            actionType: activityLogs.actionType,
            targetType: activityLogs.targetType,
            targetId: activityLogs.targetId,
            metadata: activityLogs.metadata,
            message: activityLogs.message,
            createdAt: activityLogs.createdAt,
            actor: {
                id: actor.id,
                username: actor.username,
                avatarUrl: actor.avatarUrl,
            },
            project: {
                id: projects.id,
                name: projects.name,
            },
        })
        .from(activityLogs)
        .innerJoin(projectMembers, and(
            eq(activityLogs.projectId, projectMembers.projectId),
            eq(projectMembers.userId, userId)
        ))
        .innerJoin(projects, eq(activityLogs.projectId, projects.id))
        .leftJoin(actor, eq(activityLogs.actorId, actor.id))
        .orderBy(desc(activityLogs.createdAt))
        .limit(limit);

    return rows;
};
