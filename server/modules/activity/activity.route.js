import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { getDashboardActivityHandler } from "./activity.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/dashboard", getDashboardActivityHandler);

export default router;
