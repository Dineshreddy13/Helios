import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { AUTH_MSG } from "../../../config/constants.js";
import { getCache, delCache } from "../../../utils/cache.js";
import { users } from "../../../models/index.js";
import { db } from "../../../database/db.js";
import { ApiError } from "../../../utils/ApiError.js";

export const resetPasswordService = async ({ token, password }) => {
    const userId = await getCache(`password-reset:${token}`);

    if (!userId) {
        throw new ApiError(400, AUTH_MSG.INVALID_OR_EXPIRED_TOKEN);
    }

    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    if (!user) {
        await delCache(`password-reset:${token}`);
        throw new ApiError(404, AUTH_MSG.USER_NOT_FOUND);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db
        .update(users)
        .set({ password: hashedPassword, updatedAt: new Date() })
        .where(eq(users.id, userId));

    await delCache(`password-reset:${token}`);

    await delCache(`user:${userId}`);

    return {
        message: AUTH_MSG.PASSWORD_RESET_SUCCESS || "Password has been reset successfully.",
    };
};
