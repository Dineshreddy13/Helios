import { getIO } from "./index.js";
import logger from "#utils/logger.js";

export const SocketService = {
  /**
   * Forces a specific user's socket(s) to leave a project room.
   * Useful when a member is removed from a project.
   */
  forceLeaveProject: (projectId, userId) => {
    try {
      const io = getIO();
      const userRoom = `user:${userId}`;
      const projectRoom = `project:${projectId}`;
      
      // Make all sockets in the user's room leave the project room
      io.in(userRoom).socketsLeave(projectRoom);
      logger.info(`Forced user ${userId} to leave room ${projectRoom}`);
    } catch (err) {
      logger.error(`Error forcing user ${userId} to leave project ${projectId}:`, err);
    }
  },

  /**
   * Forces all sockets to leave a project room.
   * Useful when a project is deleted.
   */
  forceLeaveAllFromProject: (projectId) => {
    try {
      const io = getIO();
      const projectRoom = `project:${projectId}`;
      
      io.in(projectRoom).socketsLeave(projectRoom);
      logger.info(`Forced all users to leave room ${projectRoom}`);
    } catch (err) {
      logger.error(`Error forcing all users to leave project ${projectId}:`, err);
    }
  }
};
