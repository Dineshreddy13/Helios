import {
    getMessages,
    sendMessage,
    editMessage,
    deleteMessage,
} from "./discussion.service.js";
import { getIO } from "../../sockets/index.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const getMessagesHandler = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const { cursor } = req.query;
    const payload = await getMessages(projectId, req.user.id, cursor);

    return res.status(200).json(
        new ApiResponse(200, { messages: payload.messages, nextCursor: payload.nextCursor }, "Messages retrieved successfully")
    );
});

export const sendMessageHandler = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const { content } = req.validated.body;
    const payload = await sendMessage(projectId, req.user.id, content);

    getIO().to(`project:${projectId}`).emit("discussion:messageSent", payload.discussion);

    return res.status(201).json(
        new ApiResponse(201, { discussion: payload.discussion }, payload.message)
    );
});

export const editMessageHandler = asyncHandler(async (req, res, next) => {
    const { messageId } = req.params;
    const { content } = req.validated.body;
    const payload = await editMessage(messageId, req.user.id, content);

    getIO()
        .to(`project:${payload.discussion.projectId}`)
        .emit("discussion:messageUpdated", payload.discussion);

    return res.status(200).json(
        new ApiResponse(200, { discussion: payload.discussion }, payload.message)
    );
});

export const deleteMessageHandler = asyncHandler(async (req, res, next) => {
    const { messageId } = req.params;
    const payload = await deleteMessage(messageId, req.user.id);

    getIO()
        .to(`project:${payload.projectId}`)
        .emit("discussion:messageDeleted", { messageId: payload.messageId });

    return res.status(200).json(
        new ApiResponse(200, { messageId: payload.messageId }, payload.message)
    );
});
