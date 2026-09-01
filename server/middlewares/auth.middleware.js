import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "#database/db.js";
import { users } from "#models/index.js";
import { getCache, setCache } from "#utils/cache.js";
import { JWT_SECRET } from "#config/env.js";
import { AUTH_MSG } from "#config/constants.js";

const getTokenFromRequest = (req) => {
  const bearerToken = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;

  return req.cookies?.auth_token || bearerToken || null;
};

export const requireAuth = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({ success: false, message: AUTH_MSG.AUTH_REQUIRED });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded?.sub;

    if (!userId) {
      return res.status(401).json({ success: false, message: AUTH_MSG.INVALID_TOKEN });
    }

    let user = await getCache(`user:${userId}`);

    if (!user) {
      const [dbUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!dbUser) {
        return res.status(401).json({ success: false, message: AUTH_MSG.USER_NOT_FOUND });
      }

      user = dbUser;
      await setCache(`user:${userId}`, user, 3600); // cache for 1 hour
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: AUTH_MSG.INVALID_OR_EXPIRED_TOKEN });
  }
};