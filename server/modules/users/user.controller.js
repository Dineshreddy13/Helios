import { searchUsers } from "./user.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const searchUsersHandler = asyncHandler(async (req, res, next) => {
    const { q } = req.validated.query;
    const payload = await searchUsers(q, req.user.id);
    
    return res.status(payload.status).json({
        success: true,
        users: payload.users,
    });
});
