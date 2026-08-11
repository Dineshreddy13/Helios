import { searchUsers } from "./user.service.js";

export const searchUsersHandler = async (req, res, next) => {
    try {
        const { q } = req.validated.query;
        const payload = await searchUsers(q, req.user.id);
        
        return res.status(payload.status).json({
            success: true,
            users: payload.users,
        });
    } catch (error) {
        next(error);
    }
};
