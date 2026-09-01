import { getCurrentUser, logout, login } from "./services/auth.service.js"
import { ApiResponse } from "#utils/ApiResponse.js";
import { register } from "./services/registration.service.js";
import { verifyOtp, resendOtp } from "./services/verification.service.js";
import { forgotPasswordService } from "./services/forgot.password.service.js";
import { resetPasswordService } from "./services/reset.password.service.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import { COOKIE_NAME } from "#config/constants.js";

const sendAuthResponse = (req, res, payload, statusCode = 200) => {
  // Save user ID in session
  if (payload.user && payload.user.id) {
    req.session.userId = payload.user.id;
  }

  return res.status(statusCode).json(
    new ApiResponse(statusCode, { user: payload.user }, payload.message)
  );
};

export const registerUser = asyncHandler(async (req, res, next) => {
  const payload = await register(req.validated.body);

  return res.status(201).json(
    new ApiResponse(201, {
      requestId: payload.requestId,
      expiresInSeconds: payload.expiresInSeconds,
    }, payload.message)
  );
});

export const loginUser = asyncHandler(async (req, res, next) => {
  const payload = await login(req.validated.body);
  return sendAuthResponse(req, res, payload, 200);
});

export const getMe = asyncHandler(async (req, res, next) => {
  const payload = await getCurrentUser(req.user);
  return res.status(200).json(
    new ApiResponse(200, { user: payload.user }, "Current user retrieved successfully")
  );
});

export const logoutUser = asyncHandler(async (req, res, next) => {
  const payload = await logout(req);
  res.clearCookie(COOKIE_NAME);
  return res.status(200).json(new ApiResponse(200, null, payload.message));
});

export const verifyOtpCode = asyncHandler(async (req, res, next) => {
  const payload = await verifyOtp(req.validated.body);
  return sendAuthResponse(req, res, payload, 200);
});

export const resendOtpCode = asyncHandler(async (req, res, next) => {
  const payload = await resendOtp(req.validated.body);

  return res.status(200).json(
    new ApiResponse(200, {
      requestId: payload.requestId,
      expiresInSeconds: payload.expiresInSeconds,
      verified: payload.verified,
    }, payload.message)
  );
});

export const forgotPasswordRequest = asyncHandler(async (req, res, next) => {
  const payload = await forgotPasswordService(req.validated.body);
  return res.status(200).json(
    new ApiResponse(200, null, payload.message)
  );
});

export const resetPasswordRequest = asyncHandler(async (req, res, next) => {
  const payload = await resetPasswordService(req.validated.body);
  return res.status(200).json(
    new ApiResponse(200, null, payload.message)
  );
});