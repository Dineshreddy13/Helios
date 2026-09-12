import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { uploadAvatar } from "../../middlewares/upload.middleware.js";
import { searchUsersQuerySchema } from "#validators/invitation.validator.js";
import { updateProfileSchema, userIdParamSchema } from "#validators/user.validator.js";
import {
    searchUsersHandler,
    getMyProfileHandler,
    getUserProfileHandler,
    updateProfileHandler,
    updateAvatarHandler,
} from "./user.controller.js";

const router = Router();

router.use(requireAuth);

// Search users (existing)
router.get("/search", validateRequest(searchUsersQuerySchema, "query"), searchUsersHandler);

// My profile
router.get("/me", getMyProfileHandler);
router.patch("/me", validateRequest(updateProfileSchema, "body"), updateProfileHandler);
router.patch("/me/avatar", uploadAvatar.single("avatar"), updateAvatarHandler);

// Public profile (must come after /me and /search to avoid param conflicts)
router.get("/:userId", validateRequest(userIdParamSchema, "params"), getUserProfileHandler);

export default router;
