import api from './axios';

export const loginApi = async ({ email, password }) => {
  const { data } = await api.post('/api/v1/auth/login', { email, password });
  return data;
};

export const registerApi = async ({ username, email, password }) => {
  const { data } = await api.post('/api/v1/auth/register', { username, email, password });
  return data;
};

export const verifyOtpApi = async ({ requestId, otp }) => {
  const { data } = await api.post('/api/v1/auth/verify-otp', { requestId, otp });
  return data;
};

export const resendOtpApi = async ({ requestId }) => {
  const { data } = await api.post('/api/v1/auth/resend-otp', { requestId });
  return data;
};

export const logoutApi = async () => {
  const { data } = await api.post('/api/v1/auth/logout');
  return data;
};

export const getMeApi = async () => {
  const { data } = await api.get('/api/v1/auth/me');
  return data;
};

export const forgotPasswordApi = async ({ email }) => {
  const { data } = await api.post('/api/v1/auth/forgot-password', { email });
  return data;
};

export const resetPasswordApi = async ({ token, password }) => {
  const { data } = await api.post('/api/v1/auth/reset-password', { token, password });
  return data;
};
