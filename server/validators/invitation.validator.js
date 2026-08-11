import { z } from "zod";
import { VALIDATION_MSG } from "../config/constants.js";

export const searchUsersQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(1, VALIDATION_MSG.SEARCH_QUERY_MIN)
    .max(100, VALIDATION_MSG.SEARCH_QUERY_MAX),
});

export const createInvitationSchema = z.object({
  invitedUserId: z.string().uuid(VALIDATION_MSG.INVALID_USER_ID),
});

export const respondInvitationSchema = z.object({
  response: z.enum(["accepted", "rejected"]),
});
