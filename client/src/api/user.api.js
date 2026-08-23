import api from './axios';

export const searchUsersApi = async (query) => {
  const { data } = await api.get('/api/v1/users/search', { params: { q: query } });
  return data;
};
