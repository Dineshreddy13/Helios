import session from "express-session";
import RedisStore from "connect-redis";
import { redis } from "./redis.js";
import { SESSION_SECRET, SESSION_MAX_AGE_MS, NODE_ENV } from "./env.js";
import { COOKIE_NAME } from "./constants.js";

const redisStore = new RedisStore({
  client: redis,
  prefix: "sess:",
});

export const sessionMiddleware = session({
  store: redisStore,
  name: COOKIE_NAME,
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_MS,
    sameSite: "lax",
  },
});
