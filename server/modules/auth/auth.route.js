import { Router } from "express";
import rateLimit from "express-rate-limit";
import { loginUser, logoutUser, getMe, registerUser, resendOtpCode, verifyOtpCode, forgotPasswordRequest, resetPasswordRequest } from "./auth.controller.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { loginAuthSchema, registerAuthSchema, resendOtpSchema, verifyOtpSchema, forgotPasswordSchema, resetPasswordSchema } from "../../validators/auth.validator.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { AUTH_MSG } from "../../config/constants.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: AUTH_MSG.TOO_MANY_ATTEMPTS },
});

router.post("/register", authLimiter, validateRequest(registerAuthSchema), registerUser);
router.post("/login", authLimiter, validateRequest(loginAuthSchema), loginUser);
router.post("/forgot-password", authLimiter, validateRequest(forgotPasswordSchema), forgotPasswordRequest);
router.post("/reset-password", authLimiter, validateRequest(resetPasswordSchema), resetPasswordRequest);

router.post("/verify-otp", authLimiter, validateRequest(verifyOtpSchema), verifyOtpCode);
router.post("/resend-otp", authLimiter, validateRequest(resendOtpSchema), resendOtpCode);
router.get("/me", requireAuth, getMe);
router.post("/logout", requireAuth, logoutUser);

export default router;