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
import { getCache, setCache, delCache } from "../../utils/cache.js";
import { requireProjectMember, requireProjectOwner, invalidateMembershipCache } from "../../utils/permissions.js";

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

    await invalidateMembershipCache(project.id, userId);
    await delCache(`projects:user:${userId}`);

    return { project, message: PROJECT_MSG.CREATED };
};

// ── getProjectsForUser ─────────────────────────────────────────────────────
export const getProjectsForUser = async (userId) => {
    const cacheKey = `projects:user:${userId}`;
    const cached = await getCache(cacheKey);
    if (cached) {
        return { projects: cached };
    }

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

    await setCache(cacheKey, rows);
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

    const role = await requireProjectMember(projectId, userId);

    return { project: { ...project, role } };
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

    await requireProjectOwner(projectId, userId);

    await db.delete(projects).where(eq(projects.id, projectId));
    await delCache(`projects:user:${userId}`);

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

    await requireProjectOwner(projectId, userId);

    const [updatedProject] = await db
        .update(projects)
        .set({ readme })
        .where(eq(projects.id, projectId))
        .returning();

    return { project: updatedProject, message: "Readme updated successfully" };
};
