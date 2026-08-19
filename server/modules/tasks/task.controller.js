import {
    createTask,
    deleteTask,
    getTasksForProject,
    moveTask,
    updateTask,
} from "./task.service.js";
import { getIO } from "../../sockets/index.js";

export const createTaskHandler = async (req, res, next) => {
    try {
        const { listId } = req.params;
        const payload = await createTask(listId, req.user.id, req.validated.body);

        if (payload.status !== 201) {
            return res.status(payload.status).json({ success: false, message: payload.message });
        }

        getIO().to(`project:${payload.task.projectId}`).emit("task:created", payload.task);

        return res.status(payload.status).json({
            success: true,
            message: payload.message,
            task: payload.task,
        });
    } catch (error) {
        next(error);
    }
};

export const getTasksHandler = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const payload = await getTasksForProject(projectId, req.user.id);

        if (payload.status !== 200) {
            return res.status(payload.status).json({ success: false, message: payload.message });
        }

        return res.status(payload.status).json({
            success: true,
            tasks: payload.tasks,
        });
    } catch (error) {
        next(error);
    }
};

export const updateTaskHandler = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const payload = await updateTask(taskId, req.user.id, req.validated.body);

        if (payload.status !== 200) {
            return res.status(payload.status).json({ success: false, message: payload.message });
        }

        getIO().to(`project:${payload.task.projectId}`).emit("task:updated", payload.task);

        return res.status(payload.status).json({
            success: true,
            message: payload.message,
            task: payload.task,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteTaskHandler = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const payload = await deleteTask(taskId, req.user.id);

        if (payload.status !== 200) {
            return res.status(payload.status).json({ success: false, message: payload.message });
        }

        getIO()
            .to(`project:${payload.projectId}`)
            .emit("task:deleted", { taskId: payload.taskId, listId: payload.listId });

        return res.status(payload.status).json({
            success: true,
            message: payload.message,
        });
    } catch (error) {
        next(error);
    }
};

export const moveTaskHandler = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const payload = await moveTask(taskId, req.user.id, req.validated.body);

        if (payload.status !== 200) {
            return res.status(payload.status).json({ success: false, message: payload.message });
        }

        getIO()
            .to(`project:${payload.task.projectId}`)
            .emit("task:moved", {
                task: payload.task,
                sourceListId: payload.sourceListId,
                targetListId: payload.targetListId,
            });

        return res.status(payload.status).json({
            success: true,
            message: payload.message,
            task: payload.task,
            sourceListId: payload.sourceListId,
            targetListId: payload.targetListId,
        });
    } catch (error) {
        next(error);
    }
};
