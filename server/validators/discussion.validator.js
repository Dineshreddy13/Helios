import { z } from "zod";
import { VALIDATION_MSG } from "#config/constants.js";

export const sendMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, VALIDATION_MSG.DISCUSSION_CONTENT_MIN)
    .max(2000, VALIDATION_MSG.DISCUSSION_CONTENT_MAX),
});

export const editMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, VALIDATION_MSG.DISCUSSION_CONTENT_MIN)
    .max(2000, VALIDATION_MSG.DISCUSSION_CONTENT_MAX),
});
