import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { searchUsersQuerySchema } from "#validators/invitation.validator.js";
import { searchUsersHandler } from "./user.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/search", validateRequest(searchUsersQuerySchema, "query"), searchUsersHandler);

export default router;
