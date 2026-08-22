import { and, asc, eq, max } from "drizzle-orm";
import { LIST_MSG, PROJECT_MSG } from "../../config/constants.js";
import { db } from "../../database/db.js";
import { lists, projectMembers } from "../../models/index.js";
import { logActivity } from "../activity/activity.service.js";
import { ApiError } from "../../utils/ApiError.js";

// ── helper ────────────────────────────────────────────────────────────────

const getMembership = async (projectId, userId) => {
    const [row] = await db
        .select({ role: projectMembers.role })
        .from(projectMembers)
        .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
        .limit(1);
    return row ?? null;
};

// ── createList ─────────────────────────────────────────────────────────────
export const createList = async (projectId, userId, { name }) => {
    const membership = await getMembership(projectId, userId);
    if (!membership) {
        throw new ApiError(403, PROJECT_MSG.NOT_MEMBER);
    }

    const [{ maxPosition }] = await db
        .select({ maxPosition: max(lists.position) })
        .from(lists)
        .where(eq(lists.projectId, projectId));

    const position = maxPosition !== null ? maxPosition + 1 : 0;

    const [list] = await db
        .insert(lists)
        .values({ projectId, name, position })
        .returning();

    await logActivity({
        projectId,
        actorId: userId,
        actionType: "list.created",
        targetType: "list",
        targetId: list.id,
        metadata: { listName: name },
    });

    return { list, message: LIST_MSG.CREATED };
};

// ── getListsForProject ─────────────────────────────────────────────────────
export const getListsForProject = async (projectId, userId) => {
    const membership = await getMembership(projectId, userId);
    if (!membership) {
        throw new ApiError(403, PROJECT_MSG.NOT_MEMBER);
    }

    const rows = await db
        .select()
        .from(lists)
        .where(eq(lists.projectId, projectId))
        .orderBy(asc(lists.position));

    return { lists: rows };
};

// ── updateList ─────────────────────────────────────────────────────────────
export const updateList = async (listId, userId, { name }) => {
    const [list] = await db
        .select()
        .from(lists)
        .where(eq(lists.id, listId))
        .limit(1);

    if (!list) {
        throw new ApiError(404, LIST_MSG.NOT_FOUND);
    }

    const membership = await getMembership(list.projectId, userId);
    if (!membership) {
        throw new ApiError(403, PROJECT_MSG.NOT_MEMBER);
    }

    const [updated] = await db
        .update(lists)
        .set({ name, updatedAt: new Date() })
        .where(eq(lists.id, listId))
        .returning();

    await logActivity({
        projectId: list.projectId,
        actorId: userId,
        actionType: "list.updated",
        targetType: "list",
        targetId: listId,
        metadata: { oldName: list.name, newName: name },
    });

    return { list: updated, message: LIST_MSG.UPDATED };
};

// ── deleteList ─────────────────────────────────────────────────────────────
export const deleteList = async (listId, userId) => {
    const [list] = await db
        .select()
        .from(lists)
        .where(eq(lists.id, listId))
        .limit(1);

    if (!list) {
        throw new ApiError(404, LIST_MSG.NOT_FOUND);
    }

    const membership = await getMembership(list.projectId, userId);
    if (!membership) {
        throw new ApiError(403, PROJECT_MSG.NOT_MEMBER);
    }

    await db.delete(lists).where(eq(lists.id, listId));

    await logActivity({
        projectId: list.projectId,
        actorId: userId,
        actionType: "list.deleted",
        targetType: "list",
        targetId: listId,
        metadata: { listName: list.name },
    });

    return { projectId: list.projectId, listId, message: LIST_MSG.DELETED };
};

// ── reorderLists ───────────────────────────────────────────────────────────
export const reorderLists = async (projectId, userId, orderedListIds) => {
    const membership = await getMembership(projectId, userId);
    if (!membership) {
        throw new ApiError(403, PROJECT_MSG.NOT_MEMBER);
    }

    const existingLists = await db
        .select({ id: lists.id })
        .from(lists)
        .where(eq(lists.projectId, projectId));

    const existingIds = new Set(existingLists.map((l) => l.id));
    const incomingIds = new Set(orderedListIds);

    const sameSize = existingIds.size === incomingIds.size;
    const allMatch = [...incomingIds].every((id) => existingIds.has(id));

    if (!sameSize || !allMatch) {
        throw new ApiError(400, LIST_MSG.IDS_MISMATCH);
    }

    const updated = await db.transaction(async (tx) => {
        const updates = orderedListIds.map((id, index) =>
            tx
                .update(lists)
                .set({ position: index, updatedAt: new Date() })
                .where(eq(lists.id, id))
                .returning()
        );
        const results = await Promise.all(updates);
        return results.flat().sort((a, b) => a.position - b.position);
    });

    return { lists: updated, message: LIST_MSG.REORDERED };
};
