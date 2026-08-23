import axios from "axios";
import useAuthStore from "../store/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Endpoints where 401 is expected and handled by the calling code
const AUTH_ENDPOINTS = ["/api/v1/auth/login", "/api/v1/auth/register", "/api/v1/auth/me"];

api.interceptors.response.use(
  (response) => {
    // Unwrap the backend's standard ApiResponse structure
    if (response.data && response.data.success === true && response.data.data !== undefined) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  (error) => {
    const requestUrl = error.config?.url || "";
    const isAuthEndpoint = AUTH_ENDPOINTS.some((ep) => requestUrl.includes(ep));

    if (error.response?.status === 401 && !isAuthEndpoint) {
      useAuthStore.getState().logout();
      window.location.replace("/");
    }

    return Promise.reject(error);
  }
);

export default api;