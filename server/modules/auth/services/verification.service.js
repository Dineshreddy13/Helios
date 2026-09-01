import { randomUUID } from 'crypto'
import { clearOtp, clearOtpMeta, generateOtp, getOtpExpiryLabel, readOtp, readOtpMeta, storeOtp, storeOtpMeta } from "../utils/otp.utils.js";
import { sendEmail } from "../../../shared/services/email.service.js";
import { AUTH_MSG, MAIL_MSG, OTP_CONFIG } from "#config/constants.js";
import { db } from "#database/db.js";
import { users } from "#models/index.js";
import { eq } from "drizzle-orm";
import { sanitizeUser } from "../utils/auth.utils.js";
import { ApiError } from "#utils/ApiError.js";
import { OTP_TTL } from "#config/env.js";

const OTP_EXPIRY_SECONDS = Number(OTP_TTL);

export const sendAndStoreOtp = async (user) => {
    const requestId = randomUUID();
    const otp = generateOtp();

    await storeOtp({
        purpose: OTP_CONFIG.PREFIX.EMAIL_VERIFICATION,
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
                expiry: getOtpExpiryLabel(OTP_EXPIRY_SECONDS),
            },
        });
    } catch (error) {
        await clearOtp(OTP_CONFIG.PREFIX.EMAIL_VERIFICATION, requestId);
        await clearOtpMeta(OTP_CONFIG.PREFIX.EMAIL_VERIFICATION, requestId);
        throw error;
    }

    return {
        requestId,
        expiresInSeconds: OTP_EXPIRY_SECONDS,
    };
};

export const verifyOtp = async ({ requestId, otp }) => {
    const record = await readOtp(OTP_CONFIG.PREFIX.EMAIL_VERIFICATION, requestId);

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
        await clearOtp(OTP_CONFIG.PREFIX.EMAIL_VERIFICATION, requestId);
        await clearOtpMeta(OTP_CONFIG.PREFIX.EMAIL_VERIFICATION, requestId);
        throw new ApiError(404, AUTH_MSG.USER_NOT_FOUND);
    }

    const [updatedUser] = await db
        .update(users)
        .set({ emailVerified: true, updatedAt: new Date() })
        .where(eq(users.id, user.id))
        .returning();

    await clearOtp(OTP_CONFIG.PREFIX.EMAIL_VERIFICATION, requestId);
    await clearOtpMeta(OTP_CONFIG.PREFIX.EMAIL_VERIFICATION, requestId);

    return {
        message: AUTH_MSG.EMAIL_VERIFICATION_OTP_VERIFIED,
        user: sanitizeUser(updatedUser),
    };
};

export const resendOtp = async ({ requestId }) => {
    const record = await readOtp(OTP_CONFIG.PREFIX.EMAIL_VERIFICATION, requestId);

    if (!record) {
        throw new ApiError(400, AUTH_MSG.EMAIL_VERIFICATION_REQUEST_INVALID);
    }

    const meta = await readOtpMeta(OTP_CONFIG.PREFIX.EMAIL_VERIFICATION, requestId);
    const now = Date.now();
    const lastResentAt = meta.lastResentAt ? new Date(meta.lastResentAt).getTime() : 0;

    if (lastResentAt && now - lastResentAt < OTP_CONFIG.RESEND_COOLDOWN_SECONDS * 1000) {
        throw new ApiError(429, AUTH_MSG.EMAIL_VERIFICATION_RESEND_TOO_SOON);
    }

    if (meta.resendCount >= OTP_CONFIG.RESEND_MAX_COUNT) {
        throw new ApiError(429, AUTH_MSG.EMAIL_VERIFICATION_RESEND_LIMIT_REACHED);
    }

    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, record.userId))
        .limit(1);

    if (!user) {
        await clearOtp(OTP_CONFIG.PREFIX.EMAIL_VERIFICATION, requestId);
        throw new ApiError(404, AUTH_MSG.USER_NOT_FOUND);
    }

    if (user.provider !== "local") {
        throw new ApiError(400, AUTH_MSG.EMAIL_VERIFICATION_LOCAL_ONLY);
    }

    if (user.emailVerified) {
        await clearOtp(OTP_CONFIG.PREFIX.EMAIL_VERIFICATION, requestId);
        return { message: AUTH_MSG.EMAIL_ALREADY_VERIFIED, verified: true };
    }

    const otp = generateOtp();

    try {
        await storeOtp({
            purpose: OTP_CONFIG.PREFIX.EMAIL_VERIFICATION,
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
            purpose: OTP_CONFIG.PREFIX.EMAIL_VERIFICATION,
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