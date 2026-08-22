import { and, eq } from "drizzle-orm";
import { INVITATION_MSG, PROJECT_MSG } from "../../config/constants.js";
import { db } from "../../database/db.js";
import {
    projectInvitations,
    projectMembers,
    projects,
    users,
} from "../../models/index.js";
import { logActivity } from "../activity/activity.service.js";
import { ApiError } from "../../utils/ApiError.js";
import { getMembership, requireProjectMember, requireProjectOwner, invalidateMembershipCache } from "../../utils/permissions.js";

// invited user alias (drizzle needs aliased table for multiple joins on same table)
import { alias } from "drizzle-orm/pg-core";
const invitedUser = alias(users, "invited_user");
const inviter = alias(users, "inviter");

// ── inviteUserToProject ────────────────────────────────────────────────────
export const inviteUserToProject = async (projectId, invitedUserId, inviterId) => {
    // 1. verify inviter is the owner
    await requireProjectOwner(projectId, inviterId);

    // 2. verify invitedUser is not already a member
    const existingMember = await getMembership(projectId, invitedUserId);
    if (existingMember) {
        throw new ApiError(409, INVITATION_MSG.ALREADY_MEMBER);
    }

    // 3. verify no pending invitation already exists
    const [existingInvitation] = await db
        .select({ id: projectInvitations.id })
        .from(projectInvitations)
        .where(
            and(
                eq(projectInvitations.projectId, projectId),
                eq(projectInvitations.invitedUserId, invitedUserId),
                eq(projectInvitations.status, "pending")
            )
        )
        .limit(1);

    if (existingInvitation) {
        throw new ApiError(409, INVITATION_MSG.ALREADY_INVITED);
    }

    // 4. insert invitation
    const [invitation] = await db
        .insert(projectInvitations)
        .values({ projectId, invitedUserId, invitedById: inviterId })
        .returning();

    // 5. return with invited user info
    const [row] = await db
        .select({
            id: projectInvitations.id,
            projectId: projectInvitations.projectId,
            status: projectInvitations.status,
            createdAt: projectInvitations.createdAt,
            invitedUser: {
                id: invitedUser.id,
                username: invitedUser.username,
                email: invitedUser.email,
            },
        })
        .from(projectInvitations)
        .innerJoin(invitedUser, eq(projectInvitations.invitedUserId, invitedUser.id))
        .where(eq(projectInvitations.id, invitation.id))
        .limit(1);

    await logActivity({
        projectId,
        actorId: inviterId,
        actionType: "invitation.sent",
        targetType: "invitation",
        targetId: invitation.id,
        metadata: { invitedUserName: row.invitedUser.username },
    });

    return { invitation: row, message: INVITATION_MSG.SENT };
};

// ── getProjectInvitations ──────────────────────────────────────────────────
export const getProjectInvitations = async (projectId, requestingUserId) => {
    await requireProjectOwner(projectId, requestingUserId);

    const rows = await db
        .select({
            id: projectInvitations.id,
            projectId: projectInvitations.projectId,
            status: projectInvitations.status,
            createdAt: projectInvitations.createdAt,
            invitedUser: {
                id: invitedUser.id,
                username: invitedUser.username,
                email: invitedUser.email,
            },
        })
        .from(projectInvitations)
        .innerJoin(invitedUser, eq(projectInvitations.invitedUserId, invitedUser.id))
        .where(
            and(
                eq(projectInvitations.projectId, projectId),
                eq(projectInvitations.status, "pending")
            )
        );

    return { invitations: rows };
};

// ── getMyInvitations ───────────────────────────────────────────────────────
export const getMyInvitations = async (userId) => {
    const rows = await db
        .select({
            id: projectInvitations.id,
            status: projectInvitations.status,
            createdAt: projectInvitations.createdAt,
            project: {
                id: projects.id,
                name: projects.name,
                description: projects.description,
            },
            invitedBy: {
                id: inviter.id,
                username: inviter.username,
            },
        })
        .from(projectInvitations)
        .innerJoin(projects, eq(projectInvitations.projectId, projects.id))
        .innerJoin(inviter, eq(projectInvitations.invitedById, inviter.id))
        .where(
            and(
                eq(projectInvitations.invitedUserId, userId),
                eq(projectInvitations.status, "pending")
            )
        );

    return { invitations: rows };
};

// ── respondToInvitation ────────────────────────────────────────────────────
export const respondToInvitation = async (invitationId, userId, response) => {
    const [invitation] = await db
        .select()
        .from(projectInvitations)
        .where(eq(projectInvitations.id, invitationId))
        .limit(1);

    if (!invitation || invitation.invitedUserId !== userId) {
        throw new ApiError(404, INVITATION_MSG.NOT_FOUND);
    }

    if (invitation.status !== "pending") {
        throw new ApiError(409, INVITATION_MSG.ALREADY_RESPONDED);
    }

    if (response === "accepted") {
        const updated = await db.transaction(async (tx) => {
            const [updatedInvitation] = await tx
                .update(projectInvitations)
                .set({ status: "accepted", updatedAt: new Date() })
                .where(eq(projectInvitations.id, invitationId))
                .returning();

            await tx.insert(projectMembers).values({
                projectId: invitation.projectId,
                userId,
                role: "member",
            });

            await logActivity({
                projectId: invitation.projectId,
                actorId: userId,
                actionType: "invitation.accepted",
                targetType: "invitation",
                targetId: invitationId,
                metadata: {},
            }, tx);

            return updatedInvitation;
        });

        await invalidateMembershipCache(invitation.projectId, userId);

        return { invitation: updated, message: INVITATION_MSG.ACCEPTED };
    }

    // response === "rejected"
    const [updated] = await db
        .update(projectInvitations)
        .set({ status: "rejected", updatedAt: new Date() })
        .where(eq(projectInvitations.id, invitationId))
        .returning();

    await logActivity({
        projectId: invitation.projectId,
        actorId: userId,
        actionType: "invitation.rejected",
        targetType: "invitation",
        targetId: invitationId,
        metadata: {},
    });

    return { invitation: updated, message: INVITATION_MSG.REJECTED };
};

// ── getProjectMembers ──────────────────────────────────────────────────────
export const getProjectMembers = async (projectId, requestingUserId) => {
    await requireProjectMember(projectId, requestingUserId);

    const rows = await db
        .select({
            id: projectMembers.id,
            role: projectMembers.role,
            joinedAt: projectMembers.joinedAt,
            user: {
                id: users.id,
                username: users.username,
                email: users.email,
                avatarUrl: users.avatarUrl,
            },
        })
        .from(projectMembers)
        .innerJoin(users, eq(projectMembers.userId, users.id))
        .where(eq(projectMembers.projectId, projectId));

    return { members: rows };
};
