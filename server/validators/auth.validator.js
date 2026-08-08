import { z } from "zod";
import { VALIDATION_MSG, AUTH_MSG } from "../config/constants.js";

const usernameSchema = z
  .string()
  .trim()
  .min(3, VALIDATION_MSG.USERNAME_MIN)
  .max(30, VALIDATION_MSG.USERNAME_MAX)
  .regex(/^[a-zA-Z0-9._-]+$/, VALIDATION_MSG.USERNAME_PATTERN);

const emailSchema = z.string().trim().email(VALIDATION_MSG.EMAIL_INVALID).transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, VALIDATION_MSG.PASSWORD_MIN)
  .max(128, VALIDATION_MSG.PASSWORD_MAX);

const requestIdSchema = z.string().uuid(VALIDATION_MSG.REQUEST_ID_INVALID);

const otpSchema = z.string().trim().regex(/^\d{6}$/, VALIDATION_MSG.OTP_INVALID);

export const registerAuthSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginAuthSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, VALIDATION_MSG.PASSWORD_REQUIRED),
});

export const verifyOtpSchema = z.object({
  requestId: requestIdSchema,
  otp: otpSchema,
});

export const resendOtpSchema = z.object({
  requestId: requestIdSchema,
});

export const googleAuthSchema = z.object({
  code: z.string().min(1, AUTH_MSG.GOOGLE_AUTH_CODE_REQUIRED),
});