import { and, desc, eq } from "drizzle-orm";
import { PROJECT_MSG } from "../../config/constants.js";
import { db } from "../../database/db.js";
import {
    lists,
    projectInvitations,
    projectMembers,
    projects,
    tasks,
} from "../../models/index.js";
import { logActivity } from "../activity/activity.service.js";
import { ApiError } from "../../utils/ApiError.js";

// ── createProject ──────────────────────────────────────────────────────────
export const createProject = async (userId, { name, description, includeReadme }) => {
    const project = await db.transaction(async (tx) => {
        const [newProject] = await tx
            .insert(projects)
            .values({ 
                name, 
                description: description ?? null, 
                ownerId: userId,
                readme: includeReadme ? `# ${name}` : null
            })
            .returning();

        await tx.insert(projectMembers).values({
            projectId: newProject.id,
            userId,
            role: "owner",
        });

        await logActivity({
            projectId: newProject.id,
            actorId: userId,
            actionType: "project.created",
            targetType: "project",
            targetId: newProject.id,
            metadata: {},
        }, tx);

        return newProject;
    });

    return { project, message: PROJECT_MSG.CREATED };
};

// ── getProjectsForUser ─────────────────────────────────────────────────────
export const getProjectsForUser = async (userId) => {
    const rows = await db
        .select({
            id: projects.id,
            name: projects.name,
            description: projects.description,
            ownerId: projects.ownerId,
            createdAt: projects.createdAt,
            updatedAt: projects.updatedAt,
            role: projectMembers.role,
        })
        .from(projects)
        .innerJoin(projectMembers, eq(projectMembers.projectId, projects.id))
        .where(eq(projectMembers.userId, userId))
        .orderBy(desc(projects.updatedAt));

    return { projects: rows };
};

// ── getProjectById ─────────────────────────────────────────────────────────
export const getProjectById = async (projectId, userId) => {
    const [project] = await db
        .select({ id: projects.id, name: projects.name, description: projects.description, readme: projects.readme, ownerId: projects.ownerId, createdAt: projects.createdAt, updatedAt: projects.updatedAt })
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1);

    if (!project) {
        throw new ApiError(404, PROJECT_MSG.NOT_FOUND);
    }

    const [membership] = await db
        .select({ role: projectMembers.role })
        .from(projectMembers)
        .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
        .limit(1);

    if (!membership) {
        throw new ApiError(403, PROJECT_MSG.NOT_MEMBER);
    }

    return { project: { ...project, role: membership.role } };
};

// ── deleteProject ──────────────────────────────────────────────────────────
export const deleteProject = async (projectId, userId) => {
    const [project] = await db
        .select({ id: projects.id, ownerId: projects.ownerId })
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1);

    if (!project) {
        throw new ApiError(404, PROJECT_MSG.NOT_FOUND);
    }

    const [membership] = await db
        .select({ role: projectMembers.role })
        .from(projectMembers)
        .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
        .limit(1);

    if (!membership || membership.role !== "owner") {
        throw new ApiError(403, PROJECT_MSG.NOT_OWNER);
    }

    await db.delete(projects).where(eq(projects.id, projectId));

    return { message: PROJECT_MSG.DELETED };
};

// ── updateProjectReadme ────────────────────────────────────────────────────
export const updateProjectReadme = async (projectId, userId, { readme }) => {
    const [project] = await db
        .select({ id: projects.id, ownerId: projects.ownerId })
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1);

    if (!project) {
        throw new ApiError(404, PROJECT_MSG.NOT_FOUND);
    }

    const [membership] = await db
        .select({ role: projectMembers.role })
        .from(projectMembers)
        .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
        .limit(1);

    if (!membership || membership.role !== "owner") {
        throw new ApiError(403, PROJECT_MSG.NOT_OWNER);
    }

    const [updatedProject] = await db
        .update(projects)
        .set({ readme })
        .where(eq(projects.id, projectId))
        .returning();

    return { project: updatedProject, message: "Readme updated successfully" };
};
