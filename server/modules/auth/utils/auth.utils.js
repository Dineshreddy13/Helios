import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET, NODE_ENV } from "#config/env.js";
import { COOKIE_NAME } from "#config/constants.js";

export const sanitizeUser = (user) => ({
    id: user.id,
    username: user.username,
    email: user.email,
    provider: user.provider,
    providerId: user.providerId,
    avatarUrl: user.avatarUrl,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

const isProduction = NODE_ENV === "production";

export const generateToken = (userId) => jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

export const authCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
};

export const buildAuthResponse = (user) => {
    const token = generateToken(user.id);
    return {
        token,
        user: sanitizeUser(user),
        cookieOptions: authCookieOptions,
        cookieName: COOKIE_NAME,
    };
};