import {
    getProjectActivity,
    getDashboardActivity,
} from "./activity.service.js";

export const getProjectActivityHandler = async (req, res, next) => {
    try {
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
    } catch (error) {
        next(error);
    }
};

export const getDashboardActivityHandler = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 30;

        const payload = await getDashboardActivity(req.user.id, { limit });

        if (payload.status !== 200) {
            return res.status(payload.status).json({ success: false, message: payload.message });
        }

        return res.status(payload.status).json({
            success: true,
            activities: payload.activities,
        });
    } catch (error) {
        next(error);
    }
};
