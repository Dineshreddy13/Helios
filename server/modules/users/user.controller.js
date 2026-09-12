import {
    searchUsers,
    getMyProfile,
    getUserProfile,
    updateUserProfile,
    updateUserAvatar,
} from "./user.service.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import { ApiResponse } from "#utils/ApiResponse.js";
import { USER_MSG } from "#config/constants.js";

// GET /users/search?q=...
export const searchUsersHandler = asyncHandler(async (req, res) => {
    const { q } = req.validated.query;
    const payload = await searchUsers(q, req.user.id);
    return res.status(200).json(
        new ApiResponse(200, { users: payload.users }, "Users retrieved successfully")
    );
});

// GET /users/me
export const getMyProfileHandler = asyncHandler(async (req, res) => {
    const profile = await getMyProfile(req.user.id);
    return res.status(200).json(
        new ApiResponse(200, { user: profile }, "Profile retrieved successfully")
    );
});

// GET /users/:userId
export const getUserProfileHandler = asyncHandler(async (req, res) => {
    const { userId } = req.validated.params;
    const profile = await getUserProfile(userId);
    return res.status(200).json(
        new ApiResponse(200, { user: profile }, "Profile retrieved successfully")
    );
});

// PATCH /users/me
export const updateProfileHandler = asyncHandler(async (req, res) => {
    const updated = await updateUserProfile(req.user.id, req.validated.body);
    return res.status(200).json(
        new ApiResponse(200, { user: updated }, USER_MSG.PROFILE_UPDATED)
    );
});

// PATCH /users/me/avatar
export const updateAvatarHandler = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json(
            new ApiResponse(400, null, "No image file provided.")
        );
    }

    const avatarUrl = req.file.path;          // Cloudinary secure URL
    const avatarPublicId = req.file.filename; // Cloudinary public_id

    const updated = await updateUserAvatar(req.user.id, avatarUrl, avatarPublicId);
    return res.status(200).json(
        new ApiResponse(200, { user: updated }, USER_MSG.AVATAR_UPDATED)
    );
});
