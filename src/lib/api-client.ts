import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import type { ApiErrorResponse } from "@/types/api-error";

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
 * Disambiguates 401 Unauthorized responses using backend error codes so invalid
 * login credentials or public security codes never trigger a false "session expired" redirect.
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const requestUrl = error.config?.url || "";
    const errorCode = error.response?.data?.code;
    const isPublicRequest =
      requestUrl.includes("/public/") ||
      error.config?.params?.public === true;
    const isAuthLogin = requestUrl.includes("/auth/login");
    const isCredentialOrCodeRejection =
      errorCode === "AUTH_INVALID_CREDENTIALS" ||
      errorCode === "INVALID_SECURITY_CODE";

    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !isPublicRequest &&
      !isAuthLogin &&
      !isCredentialOrCodeRejection
    ) {
      const reason = errorCode === "AUTH_TOKEN_MISSING" ? "unauthorized" : "expired";
      localStorage.removeItem("viking_jwt_token");

      if (window.location.pathname !== "/login") {
        window.location.href = `/login?reason=${reason}`;
      }
    }
    return Promise.reject(error);
  }
);
