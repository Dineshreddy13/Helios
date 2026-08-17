import {
    createList,
    deleteList,
    getListsForProject,
    reorderLists,
    updateList,
} from "./list.service.js";
import { getIO } from "../../sockets/index.js";

export const createListHandler = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const payload = await createList(projectId, req.user.id, req.validated.body);

        if (payload.status !== 201) {
            return res.status(payload.status).json({ success: false, message: payload.message });
        }

        getIO().to(`project:${projectId}`).emit("list:created", payload.list);

        return res.status(payload.status).json({
            success: true,
            message: payload.message,
            list: payload.list,
        });
    } catch (error) {
        next(error);
    }
};

export const getListsHandler = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const payload = await getListsForProject(projectId, req.user.id);

        if (payload.status !== 200) {
            return res.status(payload.status).json({ success: false, message: payload.message });
        }

        return res.status(payload.status).json({
            success: true,
            lists: payload.lists,
        });
    } catch (error) {
        next(error);
    }
};

export const updateListHandler = async (req, res, next) => {
    try {
        const { listId } = req.params;
        const payload = await updateList(listId, req.user.id, req.validated.body);

        if (payload.status !== 200) {
            return res.status(payload.status).json({ success: false, message: payload.message });
        }

        getIO().to(`project:${payload.list.projectId}`).emit("list:updated", payload.list);

        return res.status(payload.status).json({
            success: true,
            message: payload.message,
            list: payload.list,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteListHandler = async (req, res, next) => {
    try {
        const { listId } = req.params;
        const payload = await deleteList(listId, req.user.id);

        if (payload.status !== 200) {
            return res.status(payload.status).json({ success: false, message: payload.message });
        }

        getIO().to(`project:${payload.projectId}`).emit("list:deleted", { listId: payload.listId });

        return res.status(payload.status).json({
            success: true,
            message: payload.message,
        });
    } catch (error) {
        next(error);
    }
};

export const reorderListsHandler = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { orderedListIds } = req.validated.body;
        const payload = await reorderLists(projectId, req.user.id, orderedListIds);

        if (payload.status !== 200) {
            return res.status(payload.status).json({ success: false, message: payload.message });
        }

        getIO().to(`project:${projectId}`).emit("list:reordered", payload.lists);

        return res.status(payload.status).json({
            success: true,
            message: payload.message,
            lists: payload.lists,
        });
    } catch (error) {
        next(error);
    }
};
