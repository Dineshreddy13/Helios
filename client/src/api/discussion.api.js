import api from './axios';

export const getMessagesApi = async (projectId, cursor) => {
  const params = cursor ? { cursor } : {};
  const { data: res } = await api.get(`/api/projects/${projectId}/discussions`, { params });
  return res;
};

export const sendMessageApi = async (projectId, content) => {
  const { data: res } = await api.post(`/api/projects/${projectId}/discussions`, { content });
  return res;
};

export const editMessageApi = async (messageId, content) => {
  const { data: res } = await api.patch(`/api/projects/discussions/${messageId}`, { content });
  return res;
};

export const deleteMessageApi = async (messageId) => {
  const { data: res } = await api.delete(`/api/projects/discussions/${messageId}`);
  return res;
};
