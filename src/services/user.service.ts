import { apiClient } from "@/lib/api-client";
import { UserResponseDTO, UserCreateDTO, UserUpdateDTO, UserAutocompleteDTO, PaginatedResponse } from "@/types/user";

/**
 * User / Client Service:
 * Manages CRUD operations and debounced search lookups for registered clients and staff.
 */
export const userService = {
  /**
   * Fast autocomplete lookup returning lightweight projections.
   * Matches GET /api/user/autocomplete?query={term}
   */
  autocompleteUsers: async (query?: string, page: number = 1, limit: number = 10): Promise<UserAutocompleteDTO[]> => {
    const response = await apiClient.get<PaginatedResponse<UserAutocompleteDTO>>("/api/user/autocomplete", {
      params: { 
        ...(query ? { query } : {}),
        page,
        limit 
      },
    });
    return response.data?.data || [];
  },

  /**
   * Fetches a paginated or filtered list of users.
   * Can be filtered by query string (matching DNI, Name, or Email) or specific field selector.
   * @param search - Optional search string or DNI query.
   * @param field - Optional field selector mode ('dni', 'name', 'email', 'phone').
   */
  getUsers: async (
    search?: string,
    field?: "dni" | "name" | "email" | "phone",
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<UserResponseDTO>> => {
    const params: Record<string, string | number> = { page, limit };
    if (search) {
      if (field) {
        params.query = field;
        params[field] = search;
      } else {
        params.query = search;
      }
    }

    const response = await apiClient.get<PaginatedResponse<UserResponseDTO>>("/api/user/search", {
      params: Object.keys(params).length > 0 ? params : undefined,
    });
    
    // We remove client-side filtering since the backend handles it properly with pagination
    return response.data || { data: [], total: 0, page: 1, limit: 20 };
  },

  /**
   * Retrieves user details by UUID.
   * @param id - User UUID.
   */
  getUserById: async (id: string): Promise<UserResponseDTO> => {
    const response = await apiClient.get<UserResponseDTO | PaginatedResponse<UserResponseDTO>>("/api/user/search", { params: { id } });
    if (response.data && "data" in response.data && Array.isArray(response.data.data)) {
      return response.data.data.find((u) => u.id === id) || response.data.data[0];
    } else if (Array.isArray(response.data)) {
      return response.data.find((u) => u.id === id) || response.data[0];
    }
    return response.data as UserResponseDTO;
  },

  /**
   * Registers a new client or staff member.
   * @param data - User creation DTO including DNI and email.
   */
  createUser: async (data: UserCreateDTO): Promise<UserResponseDTO> => {
    const response = await apiClient.post<UserResponseDTO>("/api/user/save", data);
    return response.data;
  },

  /**
   * Updates user metadata.
   * Note: DNI and Email are omitted in frontend forms to respect immutable PII rules.
   * @param id - User UUID.
   * @param data - Partial update DTO.
   */
  updateUser: async (id: string, data: UserUpdateDTO): Promise<UserResponseDTO> => {
    const response = await apiClient.patch<UserResponseDTO>(`/api/user/update/${id}`, data);
    return response.data;
  },

  /**
   * Deletes a user by UUID.
   * @param id - User UUID.
   */
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/user/delete/${id}`);
  },

  /**
   * Fetches the currently authenticated user profile.
   */
  getCurrentUser: async (): Promise<UserResponseDTO> => {
    const response = await apiClient.get<UserResponseDTO>("/api/user/current");
    return response.data;
  },
};

