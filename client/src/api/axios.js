import axios from "axios";
import useAuthStore from "../store/authStore";
import { toast } from "@/components/ui/toast";

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
    } else if (error.response) {
      // Don't show toast for 401 on the /me endpoint as it's an expected failure for unauthenticated users
      if (!(error.response.status === 401 && requestUrl.includes("/api/v1/auth/me"))) {
        toast.add({
          title: "Error",
          description: error.response.data?.message || error.message || "An unexpected error occurred",
          type: "error",
        });
      }
    } else if (error.request) {
      toast.add({
        title: "Network Error",
        description: "Could not connect to the server.",
        type: "error",
      });
    }

    return Promise.reject(error);
  }
);

export default api;