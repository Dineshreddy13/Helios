import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { upload } from "../../middlewares/upload.middleware.js";
import { createTaskSchema, updateTaskSchema, moveTaskSchema } from "../../validators/task.validator.js";
import {
    createTaskHandler,
    getTasksHandler,
    updateTaskHandler,
    deleteTaskHandler,
    moveTaskHandler,
    uploadTaskFilesHandler,
    deleteTaskFileHandler,
} from "./task.controller.js";

const router = Router();

router.use(requireAuth);

// Task CRUD
router.post("/lists/:listId/tasks", validateRequest(createTaskSchema), createTaskHandler);
router.get("/:projectId/tasks", getTasksHandler);
router.patch("/tasks/:taskId/move", validateRequest(moveTaskSchema), moveTaskHandler);
router.patch("/tasks/:taskId", validateRequest(updateTaskSchema), updateTaskHandler);
router.delete("/tasks/:taskId", deleteTaskHandler);

// Task file management
router.post("/tasks/:taskId/files", upload.array("files", 5), uploadTaskFilesHandler);
router.delete("/tasks/:taskId/files/:fileId", deleteTaskFileHandler);

export default router;
