import { and, eq, ilike, ne, or } from "drizzle-orm";
import { db } from "../../database/db.js";
import { users } from "../../models/index.js";
import { ApiError } from "../../utils/ApiError.js";

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
