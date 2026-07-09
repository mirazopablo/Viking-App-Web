import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from "axios";

/**
 * Base URL for the Viking App Backend API.
 * Configured via environment variable or defaults to empty string ("") for same-origin relative routing.
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor:
 * Retrieves the stored JWT token from localStorage or cookies and injects it
 * into the Authorization Bearer header for protected RBAC routes.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("viking_jwt_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

/**
 * Response Interceptor:
 * Handles global HTTP status codes, redirecting to /login upon 401 Unauthorized
 * and normalizing backend error payloads for TanStack Query.
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Clear expired session and redirect to staff login
      localStorage.removeItem("viking_jwt_token");
      window.location.href = "/login?reason=unauthorized";
    }
    return Promise.reject(error);
  }
);
