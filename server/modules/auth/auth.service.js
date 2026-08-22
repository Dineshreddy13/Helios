import { randomInt, randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq, or } from "drizzle-orm";
import { AUTH_MSG } from "../../config/constants.js";
import { JWT_EXPIRES_IN, JWT_SECRET, OTP_TTL } from "../../config/env.js";
import { redis } from "../../config/redis.js";
import { db } from "../../database/db.js";
import { users } from "../../models/index.js";
import { sendEmail } from "../../shared/services/email.service.js";
import { MAIL_MSG } from "../../config/constants.js";
import { ApiError } from "../../utils/ApiError.js";

const COOKIE_NAME = "auth_token";
const OTP_KEY_PREFIX = "email-verification";
const OTP_META_KEY_PREFIX = "email-verification-meta";
const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = Number(OTP_TTL || 600);
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const OTP_RESEND_MAX_COUNT = 3;

const isProduction = process.env.NODE_ENV === "production";

const authCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
};

const normalizeEmail = (email) => email.trim().toLowerCase();

const buildOtpKey = (requestId) => `${OTP_KEY_PREFIX}:${requestId}`;
const buildOtpMetaKey = (requestId) => `${OTP_META_KEY_PREFIX}:${requestId}`;

const generateOtp = () => randomInt(10 ** (OTP_LENGTH - 1), 10 ** OTP_LENGTH).toString();

const getOtpExpiryLabel = (seconds) => {
    if (seconds % 60 === 0) {
        const minutes = seconds / 60;
        return `${minutes} minute${minutes === 1 ? "" : "s"}`;
    }

    return `${seconds} seconds`;
};

const sanitizeUser = (user) => ({
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

const generateToken = (userId) => jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

const buildAuthResponse = (user) => {
    const token = generateToken(user.id);

    return {
        token,
        user: sanitizeUser(user),
        cookieOptions: authCookieOptions,
        cookieName: COOKIE_NAME,
    };
};

const storeOtp = async ({ requestId, userId, email, otp }) => {
    const record = {
        requestId,
        userId,
        email,
        otp,
        createdAt: new Date().toISOString(),
    };

    await redis.set(buildOtpKey(requestId), JSON.stringify(record), "EX", OTP_EXPIRY_SECONDS);
};

const readOtp = async (requestId) => {
    const storedValue = await redis.get(buildOtpKey(requestId));

    if (!storedValue) {
        return null;
    }

    try {
        return JSON.parse(storedValue);
    } catch {
        return null;
    }
};

const clearOtp = async (requestId) => {
    await redis.del(buildOtpKey(requestId));
};

const clearOtpMeta = async (requestId) => {
    await redis.del(buildOtpMetaKey(requestId));
};

const readOtpMeta = async (requestId) => {
    const storedValue = await redis.get(buildOtpMetaKey(requestId));

    if (!storedValue) {
        return {
            resendCount: 0,
            lastResentAt: null,
        };
    }

    try {
        const parsedValue = JSON.parse(storedValue);
        return {
            resendCount: Number(parsedValue.resendCount || 0),
            lastResentAt: parsedValue.lastResentAt || null,
        };
    } catch {
        return {
            resendCount: 0,
            lastResentAt: null,
        };
    }
};

const storeOtpMeta = async ({ requestId, resendCount, lastResentAt }) => {
    await redis.set(
        buildOtpMetaKey(requestId),
        JSON.stringify({ resendCount, lastResentAt }),
        "EX",
        OTP_EXPIRY_SECONDS,
    );
};

const sendAndStoreOtp = async (user) => {
    const requestId = randomUUID();
    const otp = generateOtp();

    await storeOtp({
        requestId,
        userId: user.id,
        email: user.email,
        otp,
    });

    try {
        await sendEmail({
            to: user.email,
            subject: MAIL_MSG.OTP_SUBJECT,
            template: "otpEmail",
            data: {
                name: user.username,
                otp,
                requestId,
                expiry: "10 minutes",
            },
        });
    } catch (error) {
        await clearOtp(requestId);
        await clearOtpMeta(requestId);
        throw error;
    }

    return {
        requestId,
        expiresInSeconds: OTP_EXPIRY_SECONDS,
    };
};

export const register = async ({ username, email, password }) => {
    const normalizedEmail = normalizeEmail(email);
    const normalizedUsername = username.trim();

    const [existingUser] = await db
        .select({ id: users.id, username: users.username, email: users.email })
        .from(users)
        .where(or(eq(users.email, normalizedEmail), eq(users.username, normalizedUsername)))
        .limit(1);

    if (existingUser) {
        if (existingUser.email === normalizedEmail) {
            throw new ApiError(409, AUTH_MSG.EMAIL_EXISTS);
        }
        throw new ApiError(409, AUTH_MSG.USERNAME_TAKEN);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [user] = await db
        .insert(users)
        .values({
            username: normalizedUsername,
            email: normalizedEmail,
            password: hashedPassword,
            provider: "local",
            emailVerified: false,
        })
        .returning();

    try {
        const otpPayload = await sendAndStoreOtp(user);

        await storeOtpMeta({
            requestId: otpPayload.requestId,
            resendCount: 0,
            lastResentAt: null,
        });

        return {
            message: AUTH_MSG.CHECK_EMAIL,
            requestId: otpPayload.requestId,
            expiresInSeconds: otpPayload.expiresInSeconds,
        };
    } catch (error) {
        await db.delete(users).where(eq(users.id, user.id));
        throw new ApiError(500, AUTH_MSG.EMAIL_VERIFICATION_SEND_FAILED);
    }
};

export const verifyOtp = async ({ requestId, otp }) => {
    const record = await readOtp(requestId);

    if (!record) {
        throw new ApiError(400, AUTH_MSG.EMAIL_VERIFICATION_REQUEST_INVALID);
    }

    if (record.otp !== otp) {
        throw new ApiError(400, AUTH_MSG.EMAIL_VERIFICATION_OTP_INVALID);
    }

    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, record.userId))
        .limit(1);

    if (!user) {
        await clearOtp(requestId);
        await clearOtpMeta(requestId);
        throw new ApiError(404, AUTH_MSG.USER_NOT_FOUND);
    }

    const [updatedUser] = await db
        .update(users)
        .set({ emailVerified: true, updatedAt: new Date() })
        .where(eq(users.id, user.id))
        .returning();

    await clearOtp(requestId);
    await clearOtpMeta(requestId);

    return {
        message: AUTH_MSG.EMAIL_VERIFICATION_OTP_VERIFIED,
        ...buildAuthResponse(updatedUser),
        user: sanitizeUser(updatedUser),
    };
};

export const resendOtp = async ({ requestId }) => {
    const record = await readOtp(requestId);

    if (!record) {
        throw new ApiError(400, AUTH_MSG.EMAIL_VERIFICATION_REQUEST_INVALID);
    }

    const meta = await readOtpMeta(requestId);
    const now = Date.now();
    const lastResentAt = meta.lastResentAt ? new Date(meta.lastResentAt).getTime() : 0;

    if (lastResentAt && now - lastResentAt < OTP_RESEND_COOLDOWN_SECONDS * 1000) {
        throw new ApiError(429, AUTH_MSG.EMAIL_VERIFICATION_RESEND_TOO_SOON);
    }

    if (meta.resendCount >= OTP_RESEND_MAX_COUNT) {
        throw new ApiError(429, AUTH_MSG.EMAIL_VERIFICATION_RESEND_LIMIT_REACHED);
    }

    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, record.userId))
        .limit(1);

    if (!user) {
        await clearOtp(requestId);
        throw new ApiError(404, AUTH_MSG.USER_NOT_FOUND);
    }

    if (user.provider !== "local") {
        throw new ApiError(400, AUTH_MSG.EMAIL_VERIFICATION_LOCAL_ONLY);
    }

    if (user.emailVerified) {
        await clearOtp(requestId);
        return { message: AUTH_MSG.EMAIL_ALREADY_VERIFIED, verified: true };
    }

    const otp = generateOtp();

    try {
        await storeOtp({
            requestId,
            userId: user.id,
            email: user.email,
            otp,
        });

        await sendEmail({
            to: user.email,
            subject: MAIL_MSG.OTP_SUBJECT,
            template: "otpEmail",
            data: {
                name: user.username,
                otp,
                requestId,
                expiry: getOtpExpiryLabel(OTP_EXPIRY_SECONDS),
            },
        });

        await storeOtpMeta({
            requestId,
            resendCount: meta.resendCount + 1,
            lastResentAt: new Date().toISOString(),
        });
    } catch (error) {
        throw new ApiError(500, AUTH_MSG.EMAIL_VERIFICATION_RESEND_FAILED);
    }

    return {
        message: AUTH_MSG.EMAIL_VERIFICATION_OTP_RESENT,
        requestId,
        expiresInSeconds: OTP_EXPIRY_SECONDS,
    };
};

export const login = async ({ email, password }) => {
    const normalizedEmail = normalizeEmail(email);

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