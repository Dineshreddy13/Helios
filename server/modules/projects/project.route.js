import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { createProjectSchema } from "../../validators/project.validator.js";
import { createInvitationSchema } from "../../validators/invitation.validator.js";
import {
  createProjectHandler,
  deleteProjectHandler,
  getProjectByIdHandler,
  getProjectsHandler,
} from "./project.controller.js";
import {
  getProjectInvitationsHandler,
  getProjectMembersHandler,
  inviteUserHandler,
} from "./invitation.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/", validateRequest(createProjectSchema), createProjectHandler);
router.get("/", getProjectsHandler);
router.get("/:projectId", getProjectByIdHandler);
router.delete("/:projectId", deleteProjectHandler);

// Nested routes
router.post("/:projectId/invitations", validateRequest(createInvitationSchema), inviteUserHandler);
router.get("/:projectId/invitations", getProjectInvitationsHandler);
router.get("/:projectId/members", getProjectMembersHandler);

export default router;
