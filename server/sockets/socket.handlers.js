import logger from "#utils/logger.js";
import { getMembership } from "#modules/projects/utils/permissions.js";

export const registerSocketHandlers = (socket) => {
    logger.info(`Socket connected: ${socket.id} (user: ${socket.user.id})`);

    // Join a personal room to allow targeting all of a user's devices
    socket.join(`user:${socket.user.id}`);

    // Handle joining a project room
    socket.on("joinProject", async ({ projectId } = {}) => {
        try {
            if (!projectId) {
                socket.emit("error", { message: "projectId is required" });
                return;
            }

            // Utilize cached membership check
            const role = await getMembership(projectId, socket.user.id);

            if (!role) {
                socket.emit("error", { message: "You are not a member of this project" });
                return;
            }

            const room = `project:${projectId}`;
            socket.join(room);
            logger.info(`Socket ${socket.id} joined room ${room}`);
        } catch (err) {
            logger.error(`joinProject error for user ${socket.user.id}:`, err);
            socket.emit("error", { message: "Failed to join project" });
        }
    });

    // Handle leaving a project room
    socket.on("leaveProject", ({ projectId } = {}) => {
        if (!projectId) return;
        const room = `project:${projectId}`;
        socket.leave(room);
        logger.info(`Socket ${socket.id} left room ${room}`);
    });

    socket.on("disconnect", (reason) => {
        logger.info(`Socket disconnected: ${socket.id} (reason: ${reason})`);
    });
};
