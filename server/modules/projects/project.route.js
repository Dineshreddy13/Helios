import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { createProjectSchema, updateProjectReadmeSchema } from "../../validators/project.validator.js";
import { createInvitationSchema } from "../../validators/invitation.validator.js";
import { createListSchema, updateListSchema, reorderListsSchema } from "../../validators/list.validator.js";
import { createTaskSchema, updateTaskSchema, moveTaskSchema } from "../../validators/task.validator.js";
import {
  createProjectHandler,
  deleteProjectHandler,
  getProjectByIdHandler,
  getProjectsHandler,
  updateProjectReadmeHandler,
} from "./project.controller.js";
import {
  getProjectInvitationsHandler,
  getProjectMembersHandler,
  inviteUserHandler,
} from "./invitation.controller.js";
import {
  createListHandler,
  getListsHandler,
  updateListHandler,
  deleteListHandler,
  reorderListsHandler,
} from "./list.controller.js";
import {
  createTaskHandler,
  getTasksHandler,
  updateTaskHandler,
  deleteTaskHandler,
  moveTaskHandler,
} from "./task.controller.js";
import { getProjectActivityHandler } from "../activity/activity.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/", validateRequest(createProjectSchema), createProjectHandler);
router.get("/", getProjectsHandler);
router.get("/:projectId", getProjectByIdHandler);
router.delete("/:projectId", deleteProjectHandler);
router.put("/:projectId/readme", validateRequest(updateProjectReadmeSchema), updateProjectReadmeHandler);

// Nested invitation & member routes
router.post("/:projectId/invitations", validateRequest(createInvitationSchema), inviteUserHandler);
router.get("/:projectId/invitations", getProjectInvitationsHandler);
router.get("/:projectId/members", getProjectMembersHandler);

// List routes
router.post("/:projectId/lists", validateRequest(createListSchema), createListHandler);
router.get("/:projectId/lists", getListsHandler);
router.patch("/:projectId/lists/reorder", validateRequest(reorderListsSchema), reorderListsHandler);
router.patch("/lists/:listId", validateRequest(updateListSchema), updateListHandler);
router.delete("/lists/:listId", deleteListHandler);

// Task routes
router.post("/lists/:listId/tasks", validateRequest(createTaskSchema), createTaskHandler);
router.get("/:projectId/tasks", getTasksHandler);
router.patch("/tasks/:taskId/move", validateRequest(moveTaskSchema), moveTaskHandler);
router.patch("/tasks/:taskId", validateRequest(updateTaskSchema), updateTaskHandler);
router.delete("/tasks/:taskId", deleteTaskHandler);

// Activity routes
router.get("/:projectId/activity", getProjectActivityHandler);

export default router;
