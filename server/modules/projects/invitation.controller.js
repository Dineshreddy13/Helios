import {
    getMyInvitations,
    getProjectInvitations,
    getProjectMembers,
    inviteUserToProject,
    respondToInvitation,
} from "./invitation.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const inviteUserHandler = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const { invitedUserId } = req.validated.body;
    const payload = await inviteUserToProject(projectId, invitedUserId, req.user.id);

    return res.status(201).json(
        new ApiResponse(201, { invitation: payload.invitation }, payload.message)
    );
});

export const getProjectInvitationsHandler = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const payload = await getProjectInvitations(projectId, req.user.id);

    return res.status(200).json(
        new ApiResponse(200, { invitations: payload.invitations }, "Invitations retrieved successfully")
    );
});

export const getMyInvitationsHandler = asyncHandler(async (req, res, next) => {
    const payload = await getMyInvitations(req.user.id);

    return res.status(200).json(
        new ApiResponse(200, { invitations: payload.invitations }, "Invitations retrieved successfully")
    );
});

export const respondToInvitationHandler = asyncHandler(async (req, res, next) => {
    const { invitationId } = req.params;
    const { response } = req.validated.body;
    const payload = await respondToInvitation(invitationId, req.user.id, response);

    return res.status(200).json(
        new ApiResponse(200, { invitation: payload.invitation }, payload.message)
    );
});

export const getProjectMembersHandler = asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;
    const payload = await getProjectMembers(projectId, req.user.id);

    return res.status(200).json(
        new ApiResponse(200, { members: payload.members }, "Members retrieved successfully")
    );
});
