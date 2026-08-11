import {
    getMyInvitations,
    getProjectInvitations,
    getProjectMembers,
    inviteUserToProject,
    respondToInvitation,
} from "./invitation.service.js";

export const inviteUserHandler = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { invitedUserId } = req.validated.body;
        const payload = await inviteUserToProject(projectId, invitedUserId, req.user.id);

        if (payload.status !== 201) {
            return res.status(payload.status).json({ success: false, message: payload.message });
        }

        return res.status(payload.status).json({
            success: true,
            message: payload.message,
            invitation: payload.invitation,
        });
    } catch (error) {
        next(error);
    }
};

export const getProjectInvitationsHandler = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const payload = await getProjectInvitations(projectId, req.user.id);

        if (payload.status !== 200) {
            return res.status(payload.status).json({ success: false, message: payload.message });
        }

        return res.status(payload.status).json({
            success: true,
            invitations: payload.invitations,
        });
    } catch (error) {
        next(error);
    }
};

export const getMyInvitationsHandler = async (req, res, next) => {
    try {
        const payload = await getMyInvitations(req.user.id);

        return res.status(payload.status).json({
            success: true,
            invitations: payload.invitations,
        });
    } catch (error) {
        next(error);
    }
};

export const respondToInvitationHandler = async (req, res, next) => {
    try {
        const { invitationId } = req.params;
        const { response } = req.validated.body;
        const payload = await respondToInvitation(invitationId, req.user.id, response);

        if (payload.status !== 200) {
            return res.status(payload.status).json({ success: false, message: payload.message });
        }

        return res.status(payload.status).json({
            success: true,
            message: payload.message,
            invitation: payload.invitation,
        });
    } catch (error) {
        next(error);
    }
};

export const getProjectMembersHandler = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const payload = await getProjectMembers(projectId, req.user.id);

        if (payload.status !== 200) {
            return res.status(payload.status).json({ success: false, message: payload.message });
        }

        return res.status(payload.status).json({
            success: true,
            members: payload.members,
        });
    } catch (error) {
        next(error);
    }
};
