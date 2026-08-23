import api from './axios';

export const createListApi = async (projectId, data) => {
  const { data: res } = await api.post(`/api/v1/projects/${projectId}/lists`, data);
  return res;
};

export const getListsApi = async (projectId) => {
  const { data: res } = await api.get(`/api/v1/projects/${projectId}/lists`);
  return res;
};

export const updateListApi = async (listId, data) => {
  const { data: res } = await api.patch(`/api/v1/projects/lists/${listId}`, data);
  return res;
};

export const deleteListApi = async (listId) => {
  const { data: res } = await api.delete(`/api/v1/projects/lists/${listId}`);
  return res;
};

export const reorderListsApi = async (projectId, orderedListIds) => {
  const { data: res } = await api.patch(`/api/v1/projects/${projectId}/lists/reorder`, { orderedListIds });
  return res;
};
