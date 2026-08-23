import api from './axios';

export const inviteUserApi = async (projectId, invitedUserId) => {
  const { data } = await api.post(`/api/v1/projects/${projectId}/invitations`, { invitedUserId });
  return data;
};

export const getProjectInvitationsApi = async (projectId) => {
  const { data } = await api.get(`/api/v1/projects/${projectId}/invitations`);
  return data;
};

export const getMyInvitationsApi = async () => {
  const { data } = await api.get('/api/v1/invitations');
  return data;
};

export const respondToInvitationApi = async (invitationId, response) => {
  const { data } = await api.post(`/api/v1/invitations/${invitationId}/respond`, { response });
  return data;
};

export const getProjectMembersApi = async (projectId) => {
  const { data } = await api.get(`/api/v1/projects/${projectId}/members`);
  return data;
};
