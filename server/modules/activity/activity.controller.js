import {
    getProjectActivity,
    getDashboardActivity,
} from "./activity.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const getProjectActivityHandler = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const activities = await getProjectActivity(projectId, req.user.id, { limit, offset });

    return res.status(200).json(
        new ApiResponse(200, { activities }, "Project activity retrieved successfully")
    );
});

export const getDashboardActivityHandler = asyncHandler(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 30;

    const activities = await getDashboardActivity(req.user.id, { limit });

    return res.status(200).json(
        new ApiResponse(200, { activities }, "Dashboard activity retrieved successfully")
    );
});
