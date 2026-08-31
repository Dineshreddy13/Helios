import bcrypt from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { db } from "../../../database/db.js";
import { users } from "../../../models/auth/user.model.js";
import { ApiError } from "../../../utils/ApiError.js";
import { AUTH_MSG, OTP_CONFIG } from "../../../config/constants.js";
import { sendAndStoreOtp } from "./verification.service.js";
import { storeOtpMeta } from "../utils/otp.utils.js";

export const register = async ({ username, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
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
            purpose: OTP_CONFIG.PREFIX.EMAIL_VERIFICATION,
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
        console.log(error)
        throw new ApiError(500, AUTH_MSG.EMAIL_VERIFICATION_SEND_FAILED);
    }
};