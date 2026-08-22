import { redis } from "../config/redis.js";
import logger from "./logger.js";

export const getCache = async (key) => {
    try {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        logger.error(`Redis get error for key ${key}:`, err);
        return null;
    }
};

export const setCache = async (key, data, ttl = 3600) => {
    try {
        await redis.set(key, JSON.stringify(data), "EX", ttl);
    } catch (err) {
        logger.error(`Redis set error for key ${key}:`, err);
    }
};

export const delCache = async (key) => {
    try {
        await redis.del(key);
    } catch (err) {
        logger.error(`Redis del error for key ${key}:`, err);
    }
};
