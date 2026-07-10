import { apiClient } from "@/lib/api-client";
import { LoginRequestDTO, LoginResponseDTO, RoleDTO } from "@/types/auth";
import { UserResponseDTO } from "@/types/user";

/**
 * Authentication Service:
 * Manages user login, session validation, and RBAC role fetching.
 */
export const authService = {
  /**
   * Authenticates staff or admin credentials against the backend JWT portal
   * and composes the user profile and role metadata.
   * @param credentials - User email and password DTO.
   * @returns Promise containing JWT token and authenticated user metadata.
   */
  login: async (credentials: LoginRequestDTO): Promise<LoginResponseDTO> => {
    const response = await apiClient.post<{ token?: string }>("/auth/login", credentials);
    const token = response.data?.token;

    if (!token) {
      throw new Error("No authentication token received from backend.");
    }

    // Persist token immediately so subsequent requests in this flow attach the Bearer header
    if (typeof window !== "undefined") {
      localStorage.setItem("viking_jwt_token", token);
    }

    try {
      const [userResponse, permissionResponse] = await Promise.all([
        apiClient.get<UserResponseDTO>("/api/user/current"),
        apiClient.get<string>("/api/user-roles/user-permission").catch(() => ({ data: "STAFF" })),
      ]);

      const userData = userResponse.data;
      const roleName = permissionResponse.data || "STAFF";

      return {
        token,
        user: {
          id: userData.id || "",
          email: userData.email || credentials.email,
          name: userData.name || "Técnico",
          role: typeof roleName === "string" ? roleName : "STAFF",
        },
      };
    } catch {
      // Fallback if current user profile fetch fails
      return {
        token,
        user: {
          id: "",
          email: credentials.email,
          name: "Técnico",
          role: "STAFF",
        },
      };
    }
  },

  /**
   * Validates if the current stored JWT token is still active and valid on the server.
   * @returns Promise<boolean> true if session is valid.
   */
  validateSession: async (): Promise<boolean> => {
    try {
      await apiClient.get("/auth/validate");
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Retrieves the list of available system roles for RBAC checks.
   * @returns Promise containing array of system roles.
   */
  getRoles: async (): Promise<RoleDTO[]> => {
    const response = await apiClient.get<RoleDTO[]>("/auth/roles");
    return response.data;
  },

  /**
   * Helper to clear local authentication session and optionally redirect with a reason code.
   * @param reason - Optional query parameter (e.g. 'expired' or 'unauthorized').
   */
  logout: (reason?: string): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("viking_jwt_token");
      const targetUrl = reason
        ? `/login?reason=${encodeURIComponent(reason)}`
        : "/login";
      window.location.href = targetUrl;
    }
  },
};

