import { getCurrentUser, login, logout, register } from "./auth.service.js";

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

export const registerUser = async (req, res, next) => {
  try {
    const payload = await register(req.validated.body);

    if (payload.status !== 201) {
      return res.status(payload.status).json({ success: false, message: payload.message });
    }

    return sendAuthResponse(res, payload);
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const payload = await login(req.validated.body);

    if (payload.status !== 200) {
      return res.status(payload.status).json({ success: false, message: payload.message });
    }

    return sendAuthResponse(res, payload);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const payload = await getCurrentUser(req.user);
    return res.status(payload.status).json({ success: true, user: payload.user });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const payload = await logout();

    res.clearCookie(payload.cookieName, payload.cookieOptions);

    return res.status(payload.status).json({ success: true, message: payload.message });
  } catch (error) {
    next(error);
  }
};