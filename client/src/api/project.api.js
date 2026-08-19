import api from './axios';

export const createProjectApi = async ({ name, description, includeReadme }) => {
  const { data } = await api.post('/api/projects', { name, description, includeReadme });
  return data;
};

export const getProjectsApi = async () => {
  const { data } = await api.get('/api/projects');
  return data;
};

export const getProjectByIdApi = async (projectId) => {
  const { data } = await api.get(`/api/projects/${projectId}`);
  return data;
};

export const deleteProjectApi = async (projectId) => {
  const { data } = await api.delete(`/api/projects/${projectId}`);
  return data;
};

export const updateProjectReadmeApi = async (projectId, readme) => {
  const { data } = await api.put(`/api/projects/${projectId}/readme`, { readme });
  return data;
};
