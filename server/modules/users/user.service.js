import { and, count, eq, ilike, ne, or } from "drizzle-orm";
import { db } from "#database/db.js";
import { users, projectMembers, projects } from "#models/index.js";
import { ApiError } from "#utils/ApiError.js";
import { deleteFile } from "#utils/storage.js";
import { delCache } from "#utils/cache.js";
import { USER_MSG } from "#config/constants.js";

// ── Public profile shape (safe to send over the wire) ────────────────────────
const PUBLIC_PROFILE_COLUMNS = {
    id: users.id,
    username: users.username,
    displayName: users.displayName,
    bio: users.bio,
    location: users.location,
    status: users.status,
    avatarUrl: users.avatarUrl,
    githubUrl: users.githubUrl,
    twitterUrl: users.twitterUrl,
    linkedinUrl: users.linkedinUrl,
    websiteUrl: users.websiteUrl,
    createdAt: users.createdAt,
};

// ── Search users ──────────────────────────────────────────────────────────────
export const searchUsers = async (query, excludeUserId) => {
    const searchTerm = `%${query}%`;
    const rows = await db
        .select({
            id: users.id,
            username: users.username,
            email: users.email,
            avatarUrl: users.avatarUrl,
        })
        .from(users)
        .where(
            and(
                or(ilike(users.username, searchTerm), ilike(users.email, searchTerm)),
                ne(users.id, excludeUserId),
                eq(users.emailVerified, true)
            )
        )
        .limit(10);

    return { users: rows };
};

// ── Get user profile (public) ─────────────────────────────────────────────────
export const getUserProfile = async (userId) => {
    // Fetch the user
    const [user] = await db
        .select(PUBLIC_PROFILE_COLUMNS)
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    if (!user) throw new ApiError(404, USER_MSG.NOT_FOUND);

    // Fetch their projects with role and member count
    const memberRows = await db
        .select({
            projectId: projectMembers.projectId,
            role: projectMembers.role,
            projectName: projects.name,
            projectDescription: projects.description,
            createdAt: projects.createdAt,
        })
        .from(projectMembers)
        .innerJoin(projects, eq(projectMembers.projectId, projects.id))
        .where(eq(projectMembers.userId, userId));

    // Get member count per project
    const projectIds = memberRows.map((r) => r.projectId);
    let memberCounts = {};

    if (projectIds.length > 0) {
        const countRows = await db
            .select({
                projectId: projectMembers.projectId,
                memberCount: count(projectMembers.id),
            })
            .from(projectMembers)
            .where(
                projectIds.length === 1
                    ? eq(projectMembers.projectId, projectIds[0])
                    : or(...projectIds.map((id) => eq(projectMembers.projectId, id)))
            )
            .groupBy(projectMembers.projectId);

        memberCounts = Object.fromEntries(countRows.map((r) => [r.projectId, Number(r.memberCount)]));
    }

    const userProjects = memberRows.map((r) => ({
        id: r.projectId,
        name: r.projectName,
        description: r.projectDescription,
        role: r.role,
        memberCount: memberCounts[r.projectId] ?? 1,
        createdAt: r.createdAt,
    }));

    return { ...user, projects: userProjects };
};

// ── Get my profile (includes email) ──────────────────────────────────────────
export const getMyProfile = async (userId) => {
    const profile = await getUserProfile(userId);

    // Fetch email separately (private field)
    const [emailRow] = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    return { ...profile, email: emailRow?.email };
};

// ── Update profile text fields ────────────────────────────────────────────────
export const updateUserProfile = async (userId, data) => {
    const [updated] = await db
        .update(users)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning({
            id: users.id,
            username: users.username,
            email: users.email,
            displayName: users.displayName,
            bio: users.bio,
            location: users.location,
            status: users.status,
            avatarUrl: users.avatarUrl,
            githubUrl: users.githubUrl,
            twitterUrl: users.twitterUrl,
            linkedinUrl: users.linkedinUrl,
            websiteUrl: users.websiteUrl,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
        });

    // Invalidate the cached user so requireAuth picks up fresh data
    await delCache(`user:${userId}`);

    return updated;
};

// ── Update avatar ─────────────────────────────────────────────────────────────
export const updateUserAvatar = async (userId, avatarUrl, avatarPublicId) => {
    // Fetch current avatar public_id so we can delete the old asset
    const [current] = await db
        .select({ avatarPublicId: users.avatarPublicId })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    // Delete old Cloudinary asset if it exists
    if (current?.avatarPublicId) {
        await deleteFile(current.avatarPublicId);
    }

    const [updated] = await db
        .update(users)
        .set({ avatarUrl, avatarPublicId, updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning({
            id: users.id,
            avatarUrl: users.avatarUrl,
        });

    // Invalidate user cache
    await delCache(`user:${userId}`);

    return updated;
};
