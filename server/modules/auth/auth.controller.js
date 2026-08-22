import { getCurrentUser, login, logout, register, resendOtp, verifyOtp } from "./auth.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const sendAuthResponse = (res, payload) => {
  const cookiePayload = { httpOnly: true, path: "/" };

  if (payload.cookieOptions) {
    res.cookie(payload.cookieName, payload.token || "", {
      ...payload.cookieOptions,
      ...cookiePayload,
    });
  }

  return res.status(payload.status).json({
    success: true,
    message: payload.message,
    user: payload.user,
  });
};

export const registerUser = asyncHandler(async (req, res, next) => {
  const payload = await register(req.validated.body);

  if (payload.status !== 201) {
    return res.status(payload.status).json({ success: false, message: payload.message });
  }

  return res.status(payload.status).json({
    success: true,
    message: payload.message,
    requestId: payload.requestId,
    expiresInSeconds: payload.expiresInSeconds,
  });
});

export const loginUser = asyncHandler(async (req, res, next) => {
  const payload = await login(req.validated.body);

  if (payload.status !== 200) {
    return res.status(payload.status).json({ success: false, message: payload.message });
  }

  return sendAuthResponse(res, payload);
});

export const getMe = asyncHandler(async (req, res, next) => {
  const payload = await getCurrentUser(req.user);
  return res.status(payload.status).json({ success: true, user: payload.user });
});

export const logoutUser = asyncHandler(async (req, res, next) => {
  const payload = await logout();

  res.clearCookie(payload.cookieName, payload.cookieOptions);

  return res.status(payload.status).json({ success: true, message: payload.message });
});

export const verifyOtpCode = asyncHandler(async (req, res, next) => {
  const payload = await verifyOtp(req.validated.body);

  if (payload.status !== 200) {
    return res.status(payload.status).json({ success: false, message: payload.message });
  }

  return sendAuthResponse(res, payload);
});

export const resendOtpCode = asyncHandler(async (req, res, next) => {
  const payload = await resendOtp(req.validated.body);

  if (payload.status !== 200) {
    return res.status(payload.status).json({ success: false, message: payload.message });
  }

  return res.status(payload.status).json({
    success: true,
    message: payload.message,
    requestId: payload.requestId,
    expiresInSeconds: payload.expiresInSeconds,
    verified: payload.verified,
  });
});