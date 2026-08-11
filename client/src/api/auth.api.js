import api from './axios';

export const loginApi = async ({ email, password }) => {
  const { data } = await api.post('/api/auth/login', { email, password });
  return data;
};

export const registerApi = async ({ username, email, password }) => {
  const { data } = await api.post('/api/auth/register', { username, email, password });
  return data;
};

export const verifyOtpApi = async ({ requestId, otp }) => {
  const { data } = await api.post('/api/auth/verify-otp', { requestId, otp });
  return data;
};

export const resendOtpApi = async ({ requestId }) => {
  const { data } = await api.post('/api/auth/resend-otp', { requestId });
  return data;
};

export const logoutApi = async () => {
  const { data } = await api.post('/api/auth/logout');
  return data;
};

export const getMeApi = async () => {
  const { data } = await api.get('/api/auth/me');
  return data;
};
