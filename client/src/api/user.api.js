import api from './axios';

export const searchUsersApi = async (query) => {
  const { data } = await api.get('/api/v1/users/search', { params: { q: query } });
  return data;
};

export const getMyProfileApi = async () => {
  const { data } = await api.get('/api/v1/users/me');
  return data;
};

export const getUserProfileApi = async (userId) => {
  const { data } = await api.get(`/api/v1/users/${userId}`);
  return data;
};

export const updateProfileApi = async (profileData) => {
  const { data } = await api.patch('/api/v1/users/me', profileData);
  return data;
};

export const updateAvatarApi = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  const { data } = await api.patch('/api/v1/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
