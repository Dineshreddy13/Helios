import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { AUTH_MSG } from "#config/constants.js";
import { db } from "#database/db.js";
import { users } from "#models/index.js";
import { ApiError } from "#utils/ApiError.js";
import { sanitizeUser } from "../utils/auth.utils.js";

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
        user: sanitizeUser(user),
    };
};

export const getCurrentUser = async (user) => ({
    user: sanitizeUser(user),
});

export const logout = async (req) => {
    return new Promise((resolve, reject) => {
        req.session.destroy((err) => {
            if (err) {
                reject(new ApiError(500, "Could not log out"));
            } else {
                resolve({ message: AUTH_MSG.LOGOUT_SUCCESS });
            }
        });
    });
};