import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { eq, and } from "drizzle-orm";
import { parse as parseCookies } from "cookie";
import { db } from "#database/db.js";
import { users, projectMembers } from "#models/index.js";
import { JWT_SECRET, CLIENT_URL } from "#config/env.js";
import logger from "#utils/logger.js";

let io;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: CLIENT_URL,
            credentials: true,
        },
    });

    // ── Auth middleware ───────────────────────────────────────────────────────
    io.use(async (socket, next) => {
        try {
            // Read the HttpOnly auth_token cookie from the handshake request headers
            const rawCookies = socket.handshake.headers?.cookie || "";
            const cookies = parseCookies(rawCookies);
            const token = cookies["auth_token"] || socket.handshake.auth?.token;

            if (!token) {
                return next(new Error("Authentication required"));
            }

            const decoded = jwt.verify(token, JWT_SECRET);
            const userId = decoded?.sub;

            if (!userId) {
                return next(new Error("Invalid token"));
            }

            const [user] = await db
                .select()
                .from(users)
                .where(eq(users.id, userId))
                .limit(1);

            if (!user) {
                return next(new Error("User not found"));
            }

            socket.user = user;
            next();
        } catch (error) {
            next(new Error("Invalid or expired token"));
        }
    });

    // ── Connection handler ────────────────────────────────────────────────────
    io.on("connection", (socket) => {
        logger.info(`Socket connected: ${socket.id} (user: ${socket.user.id})`);

        // Join a personal room to allow targeting all of a user's devices
        socket.join(`user:${socket.user.id}`);

        // joinProject
        socket.on("joinProject", async ({ projectId } = {}) => {
            try {
                if (!projectId) {
                    socket.emit("error", { message: "projectId is required" });
                    return;
                }

                const [membership] = await db
                    .select({ role: projectMembers.role })
                    .from(projectMembers)
                    .where(
                        and(
                            eq(projectMembers.projectId, projectId),
                            eq(projectMembers.userId, socket.user.id)
                        )
                    )
                    .limit(1);

                if (!membership) {
                    socket.emit("error", { message: "You are not a member of this project" });
                    return;
                }

                const room = `project:${projectId}`;
                socket.join(room);
                logger.info(`Socket ${socket.id} joined room ${room}`);
            } catch (err) {
                logger.error("joinProject error:", err);
                socket.emit("error", { message: "Failed to join project" });
            }
        });

        // leaveProject
        socket.on("leaveProject", ({ projectId } = {}) => {
            if (!projectId) return;
            const room = `project:${projectId}`;
            socket.leave(room);
            logger.info(`Socket ${socket.id} left room ${room}`);
        });

        socket.on("disconnect", (reason) => {
            logger.info(`Socket disconnected: ${socket.id} (reason: ${reason})`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) throw new Error("Socket.IO has not been initialized");
    return io;
};
