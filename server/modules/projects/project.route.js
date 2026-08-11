import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { createProjectSchema } from "../../validators/project.validator.js";
import {
  createProjectHandler,
  deleteProjectHandler,
  getProjectByIdHandler,
  getProjectsHandler,
} from "./project.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/", validateRequest(createProjectSchema), createProjectHandler);
router.get("/", getProjectsHandler);
router.get("/:projectId", getProjectByIdHandler);
router.delete("/:projectId", deleteProjectHandler);

export default router;
