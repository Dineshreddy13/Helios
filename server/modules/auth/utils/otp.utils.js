import { randomInt } from "crypto";
import { OTP_CONFIG } from "#config/constants.js";
import { getCache, setCache, delCache } from "#utils/cache.js";
import { OTP_TTL } from "#config/env.js";

const OTP_EXPIRY_SECONDS = Number(OTP_TTL);

export const buildOtpKey = (purpose, requestId) => `${purpose}:${requestId}`;

export const buildOtpMetaKey = (purpose, requestId) => `${purpose}-meta:${requestId}`;

export const generateOtp = () => randomInt(10 ** (OTP_CONFIG.LENGTH - 1), 10 ** OTP_CONFIG.LENGTH).toString();

export const getOtpExpiryLabel = (seconds) => {
    if (seconds % 60 === 0) {
        const minutes = seconds / 60;
        return `${minutes} minute${minutes === 1 ? "" : "s"}`;
    }

    return `${seconds} seconds`;
};

export const storeOtp = async ({ purpose, requestId, userId, email, otp }) => {
    const record = {
        requestId,
        userId,
        email,
        otp,
        createdAt: new Date().toISOString(),
    };

    await setCache(buildOtpKey(purpose, requestId), record, OTP_EXPIRY_SECONDS);
};

export const readOtp = async (purpose, requestId) => {
    return await getCache(buildOtpKey(purpose, requestId));
};

export const clearOtp = async (purpose, requestId) => {
    await delCache(buildOtpKey(purpose, requestId));
};

export const clearOtpMeta = async (purpose, requestId) => {
    await delCache(buildOtpMetaKey(purpose, requestId));
};

export const readOtpMeta = async (purpose, requestId) => {
    const parsedValue = await getCache(buildOtpMetaKey(purpose, requestId));

    if (!parsedValue) {
        return {
            resendCount: 0,
            lastResentAt: null,
        };
    }

    return {
        resendCount: Number(parsedValue.resendCount || 0),
        lastResentAt: parsedValue.lastResentAt || null,
    };
};

export const storeOtpMeta = async ({ purpose, requestId, resendCount, lastResentAt }) => {
    await setCache(
        buildOtpMetaKey(purpose, requestId),
        { resendCount, lastResentAt },
        OTP_EXPIRY_SECONDS
    );
};