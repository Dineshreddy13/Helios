import { eq, and, lt, desc } from "drizzle-orm";
import { db } from "../../database/db.js";
import { discussionMessages, projectMembers, users } from "../../models/index.js";
import { PROJECT_MSG, DISCUSSION_MSG } from "../../config/constants.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Verify the user is a member of the project.
 */
const verifyMembership = async (projectId, userId) => {
    const [membership] = await db
        .select({ role: projectMembers.role })
        .from(projectMembers)
        .where(
            and(
                eq(projectMembers.projectId, projectId),
                eq(projectMembers.userId, userId)
            )
        )
        .limit(1);

    return membership;
};

/**
 * Build the select columns for a message with sender info.
 */
const buildMessageSelect = () => ({
    id: discussionMessages.id,
    projectId: discussionMessages.projectId,
    content: discussionMessages.content,
    isEdited: discussionMessages.isEdited,
    createdAt: discussionMessages.createdAt,
    updatedAt: discussionMessages.updatedAt,
    sender: {
        id: users.id,
        username: users.username,
        avatarUrl: users.avatarUrl,
    },
});

/**
 * Get paginated messages for a project (newest first).
 * Cursor-based pagination using createdAt.
 */
export const getMessages = async (projectId, userId, cursor) => {
    const membership = await verifyMembership(projectId, userId);
    if (!membership) {
        throw new ApiError(403, PROJECT_MSG.NOT_MEMBER);
    }

    const conditions = [eq(discussionMessages.projectId, projectId)];

    if (cursor) {
        conditions.push(lt(discussionMessages.createdAt, new Date(cursor)));
    }

    const messages = await db
        .select(buildMessageSelect())
        .from(discussionMessages)
        .leftJoin(users, eq(discussionMessages.senderId, users.id))
        .where(and(...conditions))
        .orderBy(desc(discussionMessages.createdAt))
        .limit(50);

    const nextCursor =
        messages.length === 50
            ? messages[messages.length - 1].createdAt.toISOString()
            : null;

    return { messages, nextCursor };
};

/**
 * Send a new message in a project discussion.
 */
export const sendMessage = async (projectId, userId, content) => {
    const membership = await verifyMembership(projectId, userId);
    if (!membership) {
        throw new ApiError(403, PROJECT_MSG.NOT_MEMBER);
    }

    const [inserted] = await db
        .insert(discussionMessages)
        .values({
            projectId,
            senderId: userId,
            content,
        })
        .returning();

    const [message] = await db
        .select(buildMessageSelect())
        .from(discussionMessages)
        .leftJoin(users, eq(discussionMessages.senderId, users.id))
        .where(eq(discussionMessages.id, inserted.id))
        .limit(1);

    return { message: DISCUSSION_MSG.SENT, discussion: message };
};

/**
 * Edit an existing message (author only).
 */
export const editMessage = async (messageId, userId, content) => {
    const [existing] = await db
        .select()
        .from(discussionMessages)
        .where(eq(discussionMessages.id, messageId))
        .limit(1);

    if (!existing) {
        throw new ApiError(404, DISCUSSION_MSG.NOT_FOUND);
    }

    if (existing.senderId !== userId) {
        throw new ApiError(403, DISCUSSION_MSG.NOT_AUTHOR);
    }

    await db
        .update(discussionMessages)
        .set({ content, isEdited: true, updatedAt: new Date() })
        .where(eq(discussionMessages.id, messageId));

    const [message] = await db
        .select(buildMessageSelect())
        .from(discussionMessages)
        .leftJoin(users, eq(discussionMessages.senderId, users.id))
        .where(eq(discussionMessages.id, messageId))
        .limit(1);

    return { message: DISCUSSION_MSG.UPDATED, discussion: message };
};

/**
 * Delete a message (author only).
 */
export const deleteMessage = async (messageId, userId) => {
    const [existing] = await db
        .select()
        .from(discussionMessages)
        .where(eq(discussionMessages.id, messageId))
        .limit(1);

    if (!existing) {
        throw new ApiError(404, DISCUSSION_MSG.NOT_FOUND);
    }

    if (existing.senderId !== userId) {
        throw new ApiError(403, DISCUSSION_MSG.NOT_AUTHOR);
    }

    await db
        .delete(discussionMessages)
        .where(eq(discussionMessages.id, messageId));

    return {
        message: DISCUSSION_MSG.DELETED,
        messageId,
        projectId: existing.projectId,
    };
};
