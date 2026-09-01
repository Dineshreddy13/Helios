import { Redis } from "ioredis";
import { REDIS_URL } from "./env.js";
import logger from "#utils/logger.js";

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

redis.on("connect", () => logger.info("Redis connected."));
redis.on("error", (err) => logger.error(`Redis error: ${err.message}`));