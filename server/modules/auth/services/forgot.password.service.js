import { eq } from "drizzle-orm";
import { AUTH_MSG } from "#config/constants.js";
import { setCache } from "#utils/cache.js";
import { users } from "#models/index.js";
import { sendEmail } from "../../../shared/services/email.service.js";
import { db } from "#database/db.js";
import { generateOtp, getOtpExpiryLabel } from "../utils/otp.utils.js";
import { PASSWORD_RESET_TTL } from "#config/env.js";

export const forgotPasswordService = async ({ email }) => {
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    if (!user) {
        return {
            message: AUTH_MSG.PASSWORD_RESET_EMAIL_SENT,
        };
    }

    if (user.provider !== "local") {
        return {
            message: AUTH_MSG.PASSWORD_RESET_EMAIL_SENT,
        };
    }

    const token = generateOtp();

    await setCache(`password-reset:${token}`, user.id, PASSWORD_RESET_TTL);

    await sendEmail({
        to: user.email,
        subject: "Reset your Helios password",
        template: "passwordResetEmail",
        data: {
            name: user.username,
            otp: token,
            expiry: getOtpExpiryLabel(PASSWORD_RESET_TTL),
        },
    });

    return {
        message: AUTH_MSG.PASSWORD_RESET_EMAIL_SENT,
    };
};