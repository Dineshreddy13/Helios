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
import { ApiResponse } from "../../utils/ApiResponse.js";

export const createTaskHandler = asyncHandler(async (req, res, next) => {
    const { listId } = req.params;
    const payload = await createTask(listId, req.user.id, req.validated.body);

    getIO().to(`project:${payload.task.projectId}`).emit("task:created", payload.task);

    return res.status(201).json(
        new ApiResponse(201, { task: payload.task }, payload.message)
    );
});

export const getTasksHandler = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const payload = await getTasksForProject(projectId, req.user.id);

    return res.status(200).json(
        new ApiResponse(200, { tasks: payload.tasks }, "Tasks retrieved successfully")
    );
});

export const updateTaskHandler = asyncHandler(async (req, res, next) => {
    const { taskId } = req.params;
    const payload = await updateTask(taskId, req.user.id, req.validated.body);

    getIO().to(`project:${payload.task.projectId}`).emit("task:updated", payload.task);

    return res.status(200).json(
        new ApiResponse(200, { task: payload.task }, payload.message)
    );
});

export const deleteTaskHandler = asyncHandler(async (req, res, next) => {
    const { taskId } = req.params;
    const payload = await deleteTask(taskId, req.user.id);

    getIO()
        .to(`project:${payload.projectId}`)
        .emit("task:deleted", { taskId: payload.taskId, listId: payload.listId });

    return res.status(200).json(
        new ApiResponse(200, null, payload.message)
    );
});

export const moveTaskHandler = asyncHandler(async (req, res, next) => {
    const { taskId } = req.params;
    const payload = await moveTask(taskId, req.user.id, req.validated.body);

    getIO()
        .to(`project:${payload.task.projectId}`)
        .emit("task:moved", {
            task: payload.task,
            sourceListId: payload.sourceListId,
            targetListId: payload.targetListId,
        });

    return res.status(200).json(
        new ApiResponse(200, {
            task: payload.task,
            sourceListId: payload.sourceListId,
            targetListId: payload.targetListId,
        }, payload.message)
    );
});

export const uploadTaskFilesHandler = asyncHandler(async (req, res, next) => {
    const { taskId } = req.params;
    const files = req.files ?? [];

    if (files.length === 0) {
        return res.status(400).json(new ApiResponse(400, null, "No files were uploaded."));
    }

    const payload = await uploadTaskFiles(taskId, req.user.id, files);

    getIO().to(`project:${payload.task.projectId}`).emit("task:updated", payload.task);

    return res.status(200).json(
        new ApiResponse(200, { task: payload.task }, payload.message)
    );
});

export const deleteTaskFileHandler = asyncHandler(async (req, res, next) => {
    const { taskId, fileId } = req.params;
    const payload = await deleteTaskFile(taskId, req.user.id, fileId);

    getIO().to(`project:${payload.task.projectId}`).emit("task:updated", payload.task);

    return res.status(200).json(
        new ApiResponse(200, { task: payload.task }, payload.message)
    );
});
