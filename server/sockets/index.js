import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { redis } from "#config/redis.js";
import { CLIENT_URL } from "#config/env.js";
import { sessionMiddleware } from "#config/session.js";
import { socketAuthMiddleware } from "./socket.auth.js";
import { registerSocketHandlers } from "./socket.handlers.js";

let io;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: CLIENT_URL,
            credentials: true,
        },
        adapter: createAdapter(redis, redis.duplicate()), // Use Redis for horizontal scaling
    });

    // ── Share Session Middleware ──────────────────────────────────────────────
    io.engine.use(sessionMiddleware);

    // ── Auth middleware ───────────────────────────────────────────────────────
    io.use(socketAuthMiddleware);

    // ── Connection handler ────────────────────────────────────────────────────
    io.on("connection", registerSocketHandlers);

    return io;
};

export const getIO = () => {
    if (!io) throw new Error("Socket.IO has not been initialized");
    return io;
};
