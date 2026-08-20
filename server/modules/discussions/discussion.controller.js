import {
    getMessages,
    sendMessage,
    editMessage,
    deleteMessage,
} from "./discussion.service.js";
import { getIO } from "../../sockets/index.js";

export const getMessagesHandler = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { cursor } = req.query;
        const payload = await getMessages(projectId, req.user.id, cursor);

        if (payload.status !== 200) {
            return res.status(payload.status).json({ success: false, message: payload.message });
        }

        return res.status(200).json({
            success: true,
            messages: payload.messages,
            nextCursor: payload.nextCursor,
        });
    } catch (error) {
        next(error);
    }
};

export const sendMessageHandler = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { content } = req.validated.body;
        const payload = await sendMessage(projectId, req.user.id, content);

        if (payload.status !== 201) {
            return res.status(payload.status).json({ success: false, message: payload.message });
        }

        getIO().to(`project:${projectId}`).emit("discussion:messageSent", payload.discussion);

        return res.status(201).json({
            success: true,
            message: payload.message,
            discussion: payload.discussion,
        });
    } catch (error) {
        next(error);
    }
};

export const editMessageHandler = async (req, res, next) => {
    try {
        const { messageId } = req.params;
        const { content } = req.validated.body;
        const payload = await editMessage(messageId, req.user.id, content);

        if (payload.status !== 200) {
            return res.status(payload.status).json({ success: false, message: payload.message });
        }

        getIO()
            .to(`project:${payload.discussion.projectId}`)
            .emit("discussion:messageUpdated", payload.discussion);

        return res.status(200).json({
            success: true,
            message: payload.message,
            discussion: payload.discussion,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteMessageHandler = async (req, res, next) => {
    try {
        const { messageId } = req.params;
        const payload = await deleteMessage(messageId, req.user.id);

        if (payload.status !== 200) {
            return res.status(payload.status).json({ success: false, message: payload.message });
        }

        getIO()
            .to(`project:${payload.projectId}`)
            .emit("discussion:messageDeleted", { messageId: payload.messageId });

        return res.status(200).json({
            success: true,
            message: payload.message,
        });
    } catch (error) {
        next(error);
    }
};
