import {
    getProjectActivity,
    getDashboardActivity,
} from "./activity.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const getProjectActivityHandler = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const payload = await getProjectActivity(projectId, req.user.id, { limit, offset });

    if (payload.status !== 200) {
        return res.status(payload.status).json({ success: false, message: payload.message });
    }

    return res.status(payload.status).json({
        success: true,
        activities: payload.activities,
    });
});

export const getDashboardActivityHandler = asyncHandler(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 30;

    const payload = await getDashboardActivity(req.user.id, { limit });

    if (payload.status !== 200) {
        return res.status(payload.status).json({ success: false, message: payload.message });
    }

    return res.status(payload.status).json({
        success: true,
        activities: payload.activities,
    });
});
