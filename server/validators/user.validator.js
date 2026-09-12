import { z } from "zod";
import { VALIDATION_MSG } from "#config/constants.js";

const optionalUrl = z
    .string()
    .trim()
    .url(VALIDATION_MSG.INVALID_URL)
    .optional()
    .or(z.literal("").transform(() => null))
    .nullable();

export const updateProfileSchema = z.object({
    displayName: z
        .string()
        .trim()
        .max(50, VALIDATION_MSG.DISPLAY_NAME_MAX)
        .optional()
        .nullable(),
    bio: z
        .string()
        .trim()
        .max(300, VALIDATION_MSG.BIO_MAX)
        .optional()
        .nullable(),
    location: z
        .string()
        .trim()
        .max(100, VALIDATION_MSG.LOCATION_MAX)
        .optional()
        .nullable(),
    status: z
        .string()
        .trim()
        .max(100, VALIDATION_MSG.STATUS_MAX)
        .optional()
        .nullable(),
    githubUrl: optionalUrl,
    twitterUrl: optionalUrl,
    linkedinUrl: optionalUrl,
    websiteUrl: optionalUrl,
}).refine(
    (data) => Object.keys(data).length > 0,
    { message: VALIDATION_MSG.AT_LEAST_ONE_FIELD }
);

export const userIdParamSchema = z.object({
    userId: z.string().uuid(VALIDATION_MSG.INVALID_USER_ID),
});
