import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { createTaskSchema, updateTaskSchema, moveTaskSchema } from "../../validators/task.validator.js";
import {
  createTaskHandler,
  getTasksHandler,
  updateTaskHandler,
  deleteTaskHandler,
  moveTaskHandler,
} from "./task.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/lists/:listId/tasks", validateRequest(createTaskSchema), createTaskHandler);
router.get("/:projectId/tasks", getTasksHandler);
router.patch("/tasks/:taskId/move", validateRequest(moveTaskSchema), moveTaskHandler);
router.patch("/tasks/:taskId", validateRequest(updateTaskSchema), updateTaskHandler);
router.delete("/tasks/:taskId", deleteTaskHandler);

export default router;
