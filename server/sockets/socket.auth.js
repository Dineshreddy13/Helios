import { eq } from "drizzle-orm";
import { db } from "#database/db.js";
import { users } from "#models/index.js";
import { getCache, setCache } from "#utils/cache.js";

/**
 * Socket.IO middleware to authenticate connections via express-session.
 * Utilizes Redis cache to minimize database queries on reconnections.
 */
export const socketAuthMiddleware = async (socket, next) => {
    try {
        const session = socket.request.session;
        const userId = session?.userId;

        if (!userId) {
            return next(new Error("Authentication required"));
        }

        // Try to get user from cache
        let user = await getCache(`user:${userId}`);

        if (!user) {
            // Fallback to database
            const [dbUser] = await db
                .select()
                .from(users)
                .where(eq(users.id, userId))
                .limit(1);

            if (!dbUser) {
                return next(new Error("User not found"));
            }

            user = dbUser;
            await setCache(`user:${userId}`, user, 3600); // cache for 1 hour
        }

        // Attach user to socket instance
        socket.user = user;
        next();
    } catch (error) {
        next(new Error("Authentication failed"));
    }
};
