import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { sendMessageSchema, editMessageSchema } from "#validators/discussion.validator.js";
import { projectIdParamSchema, messageIdParamSchema } from "#validators/common.validator.js";
import {
    getMessagesHandler,
    sendMessageHandler,
    editMessageHandler,
    deleteMessageHandler,
} from "./discussion.controller.js";

const router = Router();

router.use(requireAuth);

// Discussion messages
router.get("/:projectId/discussions", validateRequest(projectIdParamSchema, "params"), getMessagesHandler);
router.post("/:projectId/discussions", validateRequest(projectIdParamSchema, "params"), validateRequest(sendMessageSchema), sendMessageHandler);
router.patch("/discussions/:messageId", validateRequest(messageIdParamSchema, "params"), validateRequest(editMessageSchema), editMessageHandler);
router.delete("/discussions/:messageId", validateRequest(messageIdParamSchema, "params"), deleteMessageHandler);

export default router;
