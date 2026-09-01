import {
    createList,
    getListsForProject,
    updateList,
    deleteList,
    reorderLists,
} from "./services/list.management.service.js";
import { getIO } from "#sockets/index.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import { ApiResponse } from "#utils/ApiResponse.js";

export const createListHandler = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const payload = await createList(projectId, req.user.id, req.validated.body);

    getIO().to(`project:${projectId}`).emit("list:created", payload.list);

    return res.status(201).json(
        new ApiResponse(201, { list: payload.list }, payload.message)
    );
});

export const getListsHandler = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const payload = await getListsForProject(projectId, req.user.id);

    return res.status(200).json(
        new ApiResponse(200, { lists: payload.lists }, "Lists retrieved successfully")
    );
});

export const updateListHandler = asyncHandler(async (req, res, next) => {
    const { listId } = req.params;
    const payload = await updateList(listId, req.user.id, req.validated.body);

    getIO().to(`project:${payload.list.projectId}`).emit("list:updated", payload.list);

    return res.status(200).json(
        new ApiResponse(200, { list: payload.list }, payload.message)
    );
});

export const deleteListHandler = asyncHandler(async (req, res, next) => {
    const { listId } = req.params;
    const payload = await deleteList(listId, req.user.id);

    getIO().to(`project:${payload.projectId}`).emit("list:deleted", { listId: payload.listId });

    return res.status(200).json(
        new ApiResponse(200, null, payload.message)
    );
});

export const reorderListsHandler = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const { orderedListIds } = req.validated.body;
    const payload = await reorderLists(projectId, req.user.id, orderedListIds);

    getIO().to(`project:${projectId}`).emit("list:reordered", payload.lists);

    return res.status(200).json(
        new ApiResponse(200, { lists: payload.lists }, payload.message)
    );
});
