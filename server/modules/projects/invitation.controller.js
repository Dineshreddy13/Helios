import {
    getMyInvitations,
    getProjectInvitations,
    getProjectMembers,
    inviteUserToProject,
    respondToInvitation,
} from "./invitation.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const inviteUserHandler = asyncHandler(async (req, res, next) => {
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
});

export const getProjectInvitationsHandler = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const payload = await getProjectInvitations(projectId, req.user.id);

    if (payload.status !== 200) {
        return res.status(payload.status).json({ success: false, message: payload.message });
    }

    return res.status(payload.status).json({
        success: true,
        invitations: payload.invitations,
    });
});

export const getMyInvitationsHandler = asyncHandler(async (req, res, next) => {
    const payload = await getMyInvitations(req.user.id);

    return res.status(payload.status).json({
        success: true,
        invitations: payload.invitations,
    });
});

export const respondToInvitationHandler = asyncHandler(async (req, res, next) => {
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
});

export const getProjectMembersHandler = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const payload = await getProjectMembers(projectId, req.user.id);

    if (payload.status !== 200) {
        return res.status(payload.status).json({ success: false, message: payload.message });
    }

    return res.status(payload.status).json({
        success: true,
        members: payload.members,
    });
});
