import { and, eq } from "drizzle-orm";
import { db } from "../database/db.js";
import { projectMembers } from "../models/index.js";
import { ApiError } from "./ApiError.js";
import { PROJECT_MSG } from "../config/constants.js";
import { getCache, setCache, delCache } from "./cache.js";

/**
 * Gets a user's role in a project. Returns null if not a member.
 * Caches the result in Redis.
 */
export const getMembership = async (projectId, userId, tx = null) => {
    const cacheKey = `membership:${projectId}:${userId}`;
    const cached = await getCache(cacheKey);
    
    // We cache 'NONE' to represent null (not a member) without constantly hitting DB
    if (cached) {
        return cached.role === 'NONE' ? null : cached.role;
    }

    const client = tx ?? db;
    const [row] = await client
        .select({ role: projectMembers.role })
        .from(projectMembers)
        .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
        .limit(1);

    const role = row ? row.role : null;
    
    // Cache for 1 hour
    await setCache(cacheKey, { role: role ?? 'NONE' }, 3600);
    
    return role;
};

/**
 * Asserts the user is a member (or owner) of the project.
 * Throws 403 if they are not a member.
 */
export const requireProjectMember = async (projectId, userId, tx = null) => {
    const role = await getMembership(projectId, userId, tx);
    if (!role) {
        throw new ApiError(403, PROJECT_MSG.NOT_MEMBER);
    }
    return role;
};

/**
 * Asserts the user is specifically the owner of the project.
 * Throws 403 if they are not the owner.
 */
export const requireProjectOwner = async (projectId, userId, tx = null) => {
    const role = await getMembership(projectId, userId, tx);
    if (role !== "owner") {
        throw new ApiError(403, PROJECT_MSG.NOT_OWNER);
    }
    return role;
};

/**
 * Invalidates the membership cache for a specific user in a project.
 * Should be called whenever a member is added, removed, or their role changes.
 */
export const invalidateMembershipCache = async (projectId, userId) => {
    const cacheKey = `membership:${projectId}:${userId}`;
    await delCache(cacheKey);
};
