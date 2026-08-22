import {
    createTask,
    deleteTask,
    deleteTaskFile,
    getTasksForProject,
    moveTask,
    updateTask,
    uploadTaskFiles,
} from "./task.service.js";
import { getIO } from "../../sockets/index.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const createTaskHandler = asyncHandler(async (req, res, next) => {
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
});

export const getTasksHandler = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const payload = await getTasksForProject(projectId, req.user.id);

    if (payload.status !== 200) {
        return res.status(payload.status).json({ success: false, message: payload.message });
    }

    return res.status(payload.status).json({
        success: true,
        tasks: payload.tasks,
    });
});

export const updateTaskHandler = asyncHandler(async (req, res, next) => {
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
});

export const deleteTaskHandler = asyncHandler(async (req, res, next) => {
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
});

export const moveTaskHandler = asyncHandler(async (req, res, next) => {
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
});

export const uploadTaskFilesHandler = asyncHandler(async (req, res, next) => {
    const { taskId } = req.params;
    const files = req.files ?? [];

    if (files.length === 0) {
        return res.status(400).json({ success: false, message: "No files were uploaded." });
    }

    const payload = await uploadTaskFiles(taskId, req.user.id, files);

    if (payload.status !== 200) {
        return res.status(payload.status).json({ success: false, message: payload.message });
    }

    getIO().to(`project:${payload.task.projectId}`).emit("task:updated", payload.task);

    return res.status(payload.status).json({
        success: true,
        message: payload.message,
        task: payload.task,
    });
});

export const deleteTaskFileHandler = asyncHandler(async (req, res, next) => {
    const { taskId, fileId } = req.params;
    const payload = await deleteTaskFile(taskId, req.user.id, fileId);

    if (payload.status !== 200) {
        return res.status(payload.status).json({ success: false, message: payload.message });
    }

    getIO().to(`project:${payload.task.projectId}`).emit("task:updated", payload.task);

    return res.status(payload.status).json({
        success: true,
        message: payload.message,
        task: payload.task,
    });
});
