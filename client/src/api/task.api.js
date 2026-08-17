import api from './axios';

export const createTaskApi = async (listId, data) => {
  const { data: res } = await api.post(`/api/projects/lists/${listId}/tasks`, data);
  return res;
};

export const getTasksApi = async (projectId) => {
  const { data: res } = await api.get(`/api/projects/${projectId}/tasks`);
  return res;
};

export const updateTaskApi = async (taskId, data) => {
  const { data: res } = await api.patch(`/api/projects/tasks/${taskId}`, data);
  return res;
};

export const deleteTaskApi = async (taskId) => {
  const { data: res } = await api.delete(`/api/projects/tasks/${taskId}`);
  return res;
};

export const moveTaskApi = async (taskId, data) => {
  const { data: res } = await api.patch(`/api/projects/tasks/${taskId}/move`, data);
  return res;
};
