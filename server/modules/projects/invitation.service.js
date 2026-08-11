import { and, eq } from "drizzle-orm";
import { INVITATION_MSG, PROJECT_MSG } from "../../config/constants.js";
import { db } from "../../database/db.js";
import {
    projectInvitations,
    projectMembers,
    projects,
    users,
} from "../../models/index.js";

// ── helpers ───────────────────────────────────────────────────────────────

const getMembership = async (projectId, userId) => {
    const [row] = await db
        .select({ role: projectMembers.role })
        .from(projectMembers)
        .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
        .limit(1);
    return row ?? null;
};

// invited user alias (drizzle needs aliased table for multiple joins on same table)
import { alias } from "drizzle-orm/pg-core";
const invitedUser = alias(users, "invited_user");
const inviter = alias(users, "inviter");

// ── inviteUserToProject ────────────────────────────────────────────────────
export const inviteUserToProject = async (projectId, invitedUserId, inviterId) => {
    // 1. verify inviter is the owner
    const inviterMembership = await getMembership(projectId, inviterId);
    if (!inviterMembership || inviterMembership.role !== "owner") {
        return { status: 403, message: PROJECT_MSG.NOT_OWNER };
    }

    // 2. verify invitedUser is not already a member
    const existingMember = await getMembership(projectId, invitedUserId);
    if (existingMember) {
        return { status: 409, message: INVITATION_MSG.ALREADY_MEMBER };
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
        return { status: 409, message: INVITATION_MSG.ALREADY_INVITED };
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

    return { status: 201, message: INVITATION_MSG.SENT, invitation: row };
};

// ── getProjectInvitations ──────────────────────────────────────────────────
export const getProjectInvitations = async (projectId, requestingUserId) => {
    const membership = await getMembership(projectId, requestingUserId);
    if (!membership || membership.role !== "owner") {
        return { status: 403, message: PROJECT_MSG.NOT_OWNER };
    }

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

    return { status: 200, invitations: rows };
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

    return { status: 200, invitations: rows };
};

// ── respondToInvitation ────────────────────────────────────────────────────
export const respondToInvitation = async (invitationId, userId, response) => {
    const [invitation] = await db
        .select()
        .from(projectInvitations)
        .where(eq(projectInvitations.id, invitationId))
        .limit(1);

    if (!invitation || invitation.invitedUserId !== userId) {
        return { status: 404, message: INVITATION_MSG.NOT_FOUND };
    }

    if (invitation.status !== "pending") {
        return { status: 409, message: INVITATION_MSG.ALREADY_RESPONDED };
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

            return updatedInvitation;
        });

        return { status: 200, message: INVITATION_MSG.ACCEPTED, invitation: updated };
    }

    // response === "rejected"
    const [updated] = await db
        .update(projectInvitations)
        .set({ status: "rejected", updatedAt: new Date() })
        .where(eq(projectInvitations.id, invitationId))
        .returning();

    return { status: 200, message: INVITATION_MSG.REJECTED, invitation: updated };
};

// ── getProjectMembers ──────────────────────────────────────────────────────
export const getProjectMembers = async (projectId, requestingUserId) => {
    const membership = await getMembership(projectId, requestingUserId);
    if (!membership) {
        return { status: 403, message: PROJECT_MSG.NOT_MEMBER };
    }

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

    return { status: 200, members: rows };
};
