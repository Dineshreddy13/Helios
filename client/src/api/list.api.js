import api from './axios';

export const createListApi = async (projectId, data) => {
  const { data: res } = await api.post(`/api/projects/${projectId}/lists`, data);
  return res;
};

export const getListsApi = async (projectId) => {
  const { data: res } = await api.get(`/api/projects/${projectId}/lists`);
  return res;
};

export const updateListApi = async (listId, data) => {
  const { data: res } = await api.patch(`/api/projects/lists/${listId}`, data);
  return res;
};

export const deleteListApi = async (listId) => {
  const { data: res } = await api.delete(`/api/projects/lists/${listId}`);
  return res;
};

export const reorderListsApi = async (projectId, orderedListIds) => {
  const { data: res } = await api.patch(`/api/projects/${projectId}/lists/reorder`, { orderedListIds });
  return res;
};
