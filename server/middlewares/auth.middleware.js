import { eq } from "drizzle-orm";
import { db } from "#database/db.js";
import { users } from "#models/index.js";
import { getCache, setCache } from "#utils/cache.js";
import { AUTH_MSG } from "#config/constants.js";

export const requireAuth = async (req, res, next) => {
  try {
    const userId = req.session?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: AUTH_MSG.AUTH_REQUIRED });
    }

    let user = await getCache(`user:${userId}`);

    if (!user) {
      const [dbUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!dbUser) {
        // Session exists but user deleted from DB
        req.session.destroy();
        return res.status(401).json({ success: false, message: AUTH_MSG.USER_NOT_FOUND });
      }

      user = dbUser;
      await setCache(`user:${userId}`, user, 3600); // cache for 1 hour
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error during authentication" });
  }
};