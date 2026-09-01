import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { respondInvitationSchema } from "#validators/invitation.validator.js";
import {
  getMyInvitationsHandler,
  respondToInvitationHandler,
} from "./invitation.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", getMyInvitationsHandler);
router.post("/:invitationId/respond", validateRequest(respondInvitationSchema), respondToInvitationHandler);

export default router;
