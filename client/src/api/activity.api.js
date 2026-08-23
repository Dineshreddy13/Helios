import api from './axios';

export const getProjectActivityApi = async (projectId, { limit, offset } = {}) => {
  const params = {};
  if (limit !== undefined) params.limit = limit;
  if (offset !== undefined) params.offset = offset;
  const { data: res } = await api.get(`/api/v1/projects/${projectId}/activity`, { params });
  return res;
};

export const getDashboardActivityApi = async ({ limit } = {}) => {
  const params = {};
  if (limit !== undefined) params.limit = limit;
  const { data: res } = await api.get('/api/v1/activity/dashboard', { params });
  return res;
};
