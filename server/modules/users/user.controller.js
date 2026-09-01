import { searchUsers } from "./user.service.js";
import { asyncHandler } from "#utils/asyncHandler.js";
import { ApiResponse } from "#utils/ApiResponse.js";

export const searchUsersHandler = asyncHandler(async (req, res, next) => {
    const { q } = req.validated.query;
    const payload = await searchUsers(q, req.user.id);
    
    return res.status(200).json(
        new ApiResponse(200, { users: payload.users }, "Users retrieved successfully")
    );
});
