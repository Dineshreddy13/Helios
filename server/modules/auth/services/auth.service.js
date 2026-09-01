import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { AUTH_MSG, COOKIE_NAME } from "#config/constants.js";
import { db } from "#database/db.js";
import { users } from "#models/index.js";
import { ApiError } from "#utils/ApiError.js";
import { authCookieOptions, buildAuthResponse, sanitizeUser } from "../utils/auth.utils.js";

export const login = async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);

    if (!user) {
        throw new ApiError(401, AUTH_MSG.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new ApiError(401, AUTH_MSG.INVALID_CREDENTIALS);
    }

    if (!user.emailVerified) {
        throw new ApiError(403, AUTH_MSG.EMAIL_NOT_VERIFIED);
    }

    return {
        message: AUTH_MSG.LOGIN_SUCCESS,
        ...buildAuthResponse(user),
    };
};

export const getCurrentUser = async (user) => ({
    user: sanitizeUser(user),
});

export const logout = async () => ({
    message: AUTH_MSG.LOGOUT_SUCCESS,
    cookieName: COOKIE_NAME,
    cookieOptions: {
        ...authCookieOptions,
        maxAge: 0,
    },
});