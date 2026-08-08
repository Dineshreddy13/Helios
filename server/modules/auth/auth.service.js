import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { and, eq, or } from "drizzle-orm";
import { db } from "../../database/db.js";
import { AUTH_MSG } from "../../config/constants.js";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../../config/env.js";
import { users } from "../../models/index.js";

const COOKIE_NAME = "auth_token";

const isProduction = process.env.NODE_ENV === "production";

const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};

const normalizeEmail = (email) => email.trim().toLowerCase();

const sanitizeUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  provider: user.provider,
  providerId: user.providerId,
  avatarUrl: user.avatarUrl,
  emailVerified: user.emailVerified,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const generateToken = (userId) => jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

const buildAuthResponse = (user) => {
  const token = generateToken(user.id);

  return {
    token,
    user: sanitizeUser(user),
    cookieOptions: authCookieOptions,
    cookieName: COOKIE_NAME,
  };
};

export const register = async ({ username, email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedUsername = username.trim();

  const [existingUser] = await db
    .select({ id: users.id, username: users.username, email: users.email })
    .from(users)
    .where(or(eq(users.email, normalizedEmail), eq(users.username, normalizedUsername)))
    .limit(1);

  if (existingUser) {
    if (existingUser.email === normalizedEmail) {
      return { status: 409, message: AUTH_MSG.EMAIL_EXISTS };
    }

    return { status: 409, message: AUTH_MSG.USERNAME_TAKEN };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const [user] = await db
    .insert(users)
    .values({
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      provider: "local",
      emailVerified: false,
    })
    .returning();

  return {
    status: 201,
    message: AUTH_MSG.ACCOUNT_CREATED,
    ...buildAuthResponse(user),
  };
};

export const login = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (!user) {
    return { status: 401, message: AUTH_MSG.INVALID_CREDENTIALS };
  }

  if (user.provider !== "local") {
    return { status: 400, message: AUTH_MSG.GOOGLE_SIGN_IN_ONLY };
  }

  if (!user.password) {
    return { status: 400, message: AUTH_MSG.GOOGLE_SIGN_IN_ONLY };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return { status: 401, message: AUTH_MSG.INVALID_CREDENTIALS };
  }

  return {
    status: 200,
    message: AUTH_MSG.LOGIN_SUCCESS,
    ...buildAuthResponse(user),
  };
};

export const getCurrentUser = async (user) => ({
  status: 200,
  user: sanitizeUser(user),
});

export const logout = async () => ({
  status: 200,
  message: AUTH_MSG.LOGOUT_SUCCESS,
  cookieName: COOKIE_NAME,
  cookieOptions: {
    ...authCookieOptions,
    maxAge: 0,
  },
});