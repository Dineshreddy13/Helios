import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { sendMessageSchema, editMessageSchema } from "../../validators/discussion.validator.js";
import {
    getMessagesHandler,
    sendMessageHandler,
    editMessageHandler,
    deleteMessageHandler,
} from "./discussion.controller.js";

const router = Router();

router.use(requireAuth);

// Discussion messages
router.get("/:projectId/discussions", getMessagesHandler);
router.post("/:projectId/discussions", validateRequest(sendMessageSchema), sendMessageHandler);
router.patch("/discussions/:messageId", validateRequest(editMessageSchema), editMessageHandler);
router.delete("/discussions/:messageId", deleteMessageHandler);

export default router;
