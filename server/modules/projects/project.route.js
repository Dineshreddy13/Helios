import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { createProjectSchema, updateProjectReadmeSchema } from "#validators/project.validator.js";
import { createInvitationSchema } from "#validators/invitation.validator.js";
import { createListSchema, updateListSchema, reorderListsSchema } from "#validators/list.validator.js";
import { projectIdParamSchema, listIdParamSchema } from "#validators/common.validator.js";

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

import { getProjectActivityHandler } from "../activity/activity.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/", validateRequest(createProjectSchema), createProjectHandler);
router.get("/", getProjectsHandler);
router.get("/:projectId", validateRequest(projectIdParamSchema, "params"), getProjectByIdHandler);
router.delete("/:projectId", validateRequest(projectIdParamSchema, "params"), deleteProjectHandler);
router.put("/:projectId/readme", validateRequest(projectIdParamSchema, "params"), validateRequest(updateProjectReadmeSchema), updateProjectReadmeHandler);

// Nested invitation & member routes
router.post("/:projectId/invitations", validateRequest(projectIdParamSchema, "params"), validateRequest(createInvitationSchema), inviteUserHandler);
router.get("/:projectId/invitations", validateRequest(projectIdParamSchema, "params"), getProjectInvitationsHandler);
router.get("/:projectId/members", validateRequest(projectIdParamSchema, "params"), getProjectMembersHandler);

// List routes
router.post("/:projectId/lists", validateRequest(projectIdParamSchema, "params"), validateRequest(createListSchema), createListHandler);
router.get("/:projectId/lists", validateRequest(projectIdParamSchema, "params"), getListsHandler);
router.patch("/:projectId/lists/reorder", validateRequest(projectIdParamSchema, "params"), validateRequest(reorderListsSchema), reorderListsHandler);
router.patch("/lists/:listId", validateRequest(listIdParamSchema, "params"), validateRequest(updateListSchema), updateListHandler);
router.delete("/lists/:listId", validateRequest(listIdParamSchema, "params"), deleteListHandler);

// Activity routes
router.get("/:projectId/activity", validateRequest(projectIdParamSchema, "params"), getProjectActivityHandler);

export default router;
