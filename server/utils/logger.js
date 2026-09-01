import pino from "pino";
import { LOG_LEVEL, NODE_ENV } from "#config/env.js";

const logger = pino({
    level: LOG_LEVEL || "info",
    transport: NODE_ENV !== "production"
        ? {
            target: "pino-pretty",
            options: {
                colorize: true,
                translateTime: "SYS:standard",
                ignore: "pid,hostname",
                messageFormat: "{msg}",
                // hideObject: true
            },
        }
        : undefined,
});

export default logger;